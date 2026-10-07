import logging
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.job import JobRequirement
from app.models.application import Application
from app.models.match import Match
from app.models.cv import CV

logger = logging.getLogger(__name__)

def compute_skill_overlap(job_skills: list, student_skills: list) -> float:
    if not job_skills:
        return 1.0  # If job requires no specific skills, everyone is 100% match on skills.
    if not student_skills:
        return 0.0

    job_set = set([s.strip().lower() for s in job_skills])
    student_set = set([s.strip().lower() for s in student_skills])

    intersection = job_set.intersection(student_set)
    # Using simple coverage ratio of required skills, or Jaccard
    # Let's use simple overlap ratio for the job's required skills:
    return len(intersection) / len(job_set)

def run_matching_for_job(db: Session, job_id: UUID):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        logger.error(f"Job {job_id} not found for matching")
        return

    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    for app in applications:
        student = app.student
        
        # Hard filters
        hard_filter_passed = True
        
        # 1. CGPA
        if job.min_cgpa is not None and student.cgpa < float(job.min_cgpa):
            hard_filter_passed = False
            
        # 2. Backlogs
        if job.max_backlogs is not None and student.backlogs > job.max_backlogs:
            hard_filter_passed = False
            
        # 3. Branches
        if job.allowed_branches and len(job.allowed_branches) > 0:
            if student.branch not in job.allowed_branches:
                hard_filter_passed = False

        # Soft Score
        cv = db.query(CV).filter(CV.student_id == student.id).first()
        student_skills = cv.skills if cv and cv.skills else []
        job_skills = job.required_skills if job.required_skills else []
        
        skill_score = compute_skill_overlap(job_skills, student_skills)
        
        included_in_shortlist = hard_filter_passed
        
        # Upsert Match
        match = db.query(Match).filter(Match.job_id == job_id, Match.student_id == student.id).first()
        if not match:
            match = Match(
                job_id=job_id,
                student_id=student.id,
                application_id=app.id
            )
            db.add(match)
            
        match.skill_score = skill_score
        match.hard_filter_passed = hard_filter_passed
        match.included_in_shortlist = included_in_shortlist
        
    db.commit()
    logger.info(f"Matching complete for job {job_id}. Processed {len(applications)} applications.")

