-- Speed up the per-trainer queries that every dashboard page runs.
CREATE INDEX IF NOT EXISTS "Group_trainerId_idx" ON "Group"("trainerId");
CREATE INDEX IF NOT EXISTS "Student_trainerId_status_idx" ON "Student"("trainerId", "status");
CREATE INDEX IF NOT EXISTS "Student_groupId_idx" ON "Student"("groupId");
