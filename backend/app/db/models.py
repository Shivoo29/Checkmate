"""
Database models
"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text, Integer, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


class TestStatus(str, enum.Enum):
    """Test execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class IssueSeverity(str, enum.Enum):
    """Issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    plan = Column(String(50), default="free")  # free, pro, team, enterprise

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    """Project model"""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    target_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    status = Column(String(50), default="active")  # active, archived, deleted

    # Test configuration
    test_config = Column(JSONB, nullable=True)  # Store test preferences

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="projects")
    tests = relationship("Test", back_populates="project", cascade="all, delete-orphan")


class Test(Base):
    """Test execution model"""
    __tablename__ = "tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    test_type = Column(String(100), nullable=False)  # full, auth, performance, security, ui
    status = Column(SQLEnum(TestStatus), default=TestStatus.PENDING)

    # Test results
    results = Column(JSONB, nullable=True)

    # Execution info
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Screenshots and media
    screenshots = Column(JSONB, nullable=True)  # List of screenshot URLs
    videos = Column(JSONB, nullable=True)  # List of video URLs

    # Error information
    error_message = Column(Text, nullable=True)
    error_stack = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="tests")
    issues = relationship("Issue", back_populates="test", cascade="all, delete-orphan")
    manual_results = relationship("ManualTestResult", back_populates="test", cascade="all, delete-orphan")


class Issue(Base):
    """Issue/Bug model discovered during testing"""
    __tablename__ = "issues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)

    severity = Column(SQLEnum(IssueSeverity), nullable=False)
    category = Column(String(100), nullable=False)  # auth, performance, security, ui, etc.

    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    # Location info
    url = Column(String(500), nullable=True)
    element_selector = Column(String(500), nullable=True)

    # Evidence
    screenshot_url = Column(String(500), nullable=True)
    code_snippet = Column(Text, nullable=True)

    # Status
    status = Column(String(50), default="open")  # open, acknowledged, fixed, wont_fix

    # Additional metadata
    metadata = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    test = relationship("Test", back_populates="issues")
    comments = relationship("Comment", back_populates="issue", cascade="all, delete-orphan")


class Comment(Base):
    """Comment on an issue"""
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="comments")


class ManualTestResult(Base):
    """Manual test results from human testers"""
    __tablename__ = "manual_test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Manual test data
    test_data = Column(JSONB, nullable=False)  # Form responses, ratings, etc.

    # Media files
    screenshots = Column(JSONB, nullable=True)
    videos = Column(JSONB, nullable=True)

    # Duration
    test_duration_seconds = Column(Integer, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    test = relationship("Test", back_populates="manual_results")


class Report(Base):
    """Generated report model"""
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)

    report_type = Column(String(50), nullable=False)  # pdf, json, html
    file_url = Column(String(500), nullable=True)

    # Report metadata
    metadata = Column(JSONB, nullable=True)

    generated_at = Column(DateTime, default=datetime.utcnow)


class Webhook(Base):
    """Webhook configuration for notifications"""
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)

    url = Column(String(500), nullable=False)
    events = Column(JSONB, nullable=False)  # List of events to trigger: test_completed, issue_found, etc.

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
