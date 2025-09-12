# Branch Management Relationship Diagram

## Current Challenge
Penang is both a **sub-branch** and a **managing entity** for other sub-branches.

## Recommended Structure

### Database Tables After Modification:

```
main_branches:
┌─────┬─────────────────────┬──────────────────────┐
│ id  │ name               │ manage_sub_branches  │
├─────┼─────────────────────┼──────────────────────┤
│ 1   │ Northern Malaysia  │ 1 (Penang)          │
│ 2   │ Central Malaysia   │ 4 (KL)              │
│ 3   │ Southern Malaysia  │ 7 (Johor Bahru)     │
└─────┴─────────────────────┴──────────────────────┘

sub_branches:
┌─────┬─────────────────┬──────────────────┬─────────────────────────┐
│ id  │ name           │ main_branch_id   │ managing_sub_branch_id  │
├─────┼─────────────────┼──────────────────┼─────────────────────────┤
│ 1   │ Penang         │ 1                │ NULL (manages itself)   │
│ 2   │ Kedah          │ 1                │ 1 (managed by Penang)   │
│ 3   │ Ipoh           │ 1                │ 1 (managed by Penang)   │
│ 4   │ KL             │ 2                │ NULL (manages itself)   │
│ 5   │ Seremban       │ 2                │ 4 (managed by KL)       │
│ 6   │ Melaka         │ 2                │ 4 (managed by KL)       │
│ 7   │ Johor Bahru    │ 3                │ NULL (manages itself)   │
└─────┴─────────────────┴──────────────────┴─────────────────────────┘
```

## Visual Hierarchy:

```
📍 Northern Malaysia (Main Branch)
   🏢 Penang Sub-branch (Managing Sub-branch)
      ├── 📋 Manages itself (local classes, students)
      ├── 📋 Manages Kedah Sub-branch
      └── 📋 Manages Ipoh Sub-branch
   
   🏢 Kedah Sub-branch
      └── 📋 Managed by Penang
   
   🏢 Ipoh Sub-branch  
      └── 📋 Managed by Penang

📍 Central Malaysia (Main Branch)
   🏢 KL Sub-branch (Managing Sub-branch)
      ├── 📋 Manages itself
      ├── 📋 Manages Seremban Sub-branch
      └── 📋 Manages Melaka Sub-branch
```

## Key Relationships:

1. **Main Branch → Managing Sub-branch**: One-to-One
   - `main_branches.manage_sub_branches` → `sub_branches.id`

2. **Main Branch → All Sub-branches**: One-to-Many
   - `main_branches.id` ← `sub_branches.main_branch_id`

3. **Managing Sub-branch → Managed Sub-branches**: One-to-Many
   - `sub_branches.id` ← `sub_branches.managing_sub_branch_id`

## Benefits:

✅ **Penang is both a sub-branch AND manages other sub-branches**
✅ **Clear hierarchy**: Northern Malaysia → Penang → Kedah, Ipoh
✅ **Flexible**: Any sub-branch can become a managing sub-branch
✅ **Simple queries** to get managed sub-branches
✅ **Maintains data integrity** with foreign key constraints

## Application Logic:

- **Penang admin** can see and manage:
  - Penang's own data (classes, students, attendance)
  - Kedah's data (classes, students, attendance)  
  - Ipoh's data (classes, students, attendance)

- **Kedah admin** can only see:
  - Kedah's own data
  
- **Super admin** can see everything across all branches