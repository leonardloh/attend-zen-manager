# Main Branch & Sub-Branch Relationship Workflow

## Business Logic Understanding

### Northern Malaysia Example:
- **Main Branch**: Northern Malaysia 
- **Representative Sub-branch**: Penang Sub-branch (acts as headquarters)
- **Other Sub-branches**: Kedah, Ipoh, etc. (all belong to Northern Malaysia)

### Database Relationship:
```
main_branches table:
- id: auto-generated
- name: "Northern Malaysia"  
- manage_sub_branches: [references sub_branches.id] -> Penang Sub-branch ID
- person_in_charge: [references students.id]

sub_branches table:
- id: auto-generated
- name: "Penang", "Kedah", "Ipoh"
- main_branch_id: [references main_branches.id] -> Northern Malaysia ID  
- person_in_charge: [references students.id]
```

## Recommended Workflow:

### Step 1: Fix Database Constraint
1. Run the `fix_main_branches_constraint.sql` script
2. This removes the problematic constraint while preserving logical relationships

### Step 2: Create Main Branches and Sub-Branches
**Option A - Create Main Branch First:**
1. Create "Northern Malaysia" main branch (without representative sub-branch initially)
2. Create "Penang" sub-branch (assign to Northern Malaysia)  
3. Create "Kedah" sub-branch (assign to Northern Malaysia)
4. Update "Northern Malaysia" main branch to set Penang as representative

**Option B - Create Representative Sub-Branch First:**
1. Create "Penang" sub-branch (without main branch assignment initially)
2. Create "Northern Malaysia" main branch (set Penang as representative)
3. Update "Penang" sub-branch to belong to Northern Malaysia
4. Create other sub-branches (Kedah, Ipoh) under Northern Malaysia

### Step 3: Application Features Needed
- **Main Branch Form**: Dropdown to select which sub-branch represents this main branch
- **Sub-Branch Form**: Dropdown to select which main branch this sub-branch belongs to  
- **Validation**: Ensure representative sub-branch also belongs to the same main branch

## Current Status
The constraint `main_branches_id_fkey` needs to be dropped to allow normal ID generation.
After fixing this, you can create main branches successfully.