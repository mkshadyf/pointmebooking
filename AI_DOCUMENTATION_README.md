# AI Documentation Guide for PointMe

This guide explains the structure and purpose of AI-related documentation in the PointMe project. It serves as a reference for both AI agents and developers to understand how AI assistance is organized and documented.

## Documentation Structure

### 1. AI Rules and Guidelines
Located in `.cursor/rules/` directory:

- **ai_cascade_directive.mdc**: High-level directives for AI assistants
- **ai_continuity_rules.mdc**: Rules for maintaining continuity across sessions
- **ai_agent_workflow.mdc**: Specific workflow for AI agents
- **pointme-rules.mdc**: Project implementation guidelines
- **point-me-debugging-rules.mdc**: Context for debugging specific issues

### 2. AI Session Documentation
- **AI_SESSION_TEMPLATE.md**: Template for documenting AI-assisted sessions
- **COMPOSER_SESSION_SUMMARY.md**: Summary of the previous composer session
- **AI_ASSISTED_CODING_GUIDE.md**: Best practices for AI-assisted coding

### 3. Project Progress Tracking
- **PROGRESS.md**: Tracks completed and in-progress tasks, including AI contributions
- **IMPLEMENTATION_ROADMAP.md**: High-level project planning and timeline

## For AI Agents

### Responsibilities
1. **Documentation**:
   - Document all suggestions, changes, and reasoning
   - Update relevant documentation after each session
   - Maintain clear separation between AI contributions and developer tasks

2. **Context Acquisition**:
   - Analyze file structure before making suggestions
   - Reference specific files and line numbers
   - Understand project architecture and patterns

3. **Implementation**:
   - Follow established patterns and coding standards
   - Prioritize type safety and error handling
   - Document edge cases and potential issues

### Workflow
1. **Start each session** by reviewing:
   - Current task in IMPLEMENTATION_ROADMAP.md
   - Project status in PROGRESS.md
   - Relevant rules in .cursor/rules/

2. **During development**:
   - Document your analysis and approach
   - Clearly separate AI contributions from developer tasks
   - Reference specific files and line numbers

3. **End each session** by updating:
   - PROGRESS.md with completed tasks and AI contributions
   - AI session documentation with learning points
   - IMPLEMENTATION_ROADMAP.md if timeline changes

## For Developers

### How to Work with AI Documentation

1. **Session Preparation**:
   - Use AI_SESSION_TEMPLATE.md to create a new session document
   - Provide clear context, including relevant files and goals
   - Reference specific issues or requirements

2. **During Development**:
   - Review AI analysis and suggestions
   - Complete the developer tasks section
   - Provide feedback on AI contributions

3. **After Completion**:
   - Review and finalize documentation updates
   - Add any additional learning points
   - Update project status in PROGRESS.md

### Best Practices

1. **Clear Task Definition**:
   - Be specific about what you need from the AI
   - Provide relevant file paths and context
   - Define success criteria

2. **Effective Feedback**:
   - Document what worked and what didn't
   - Update AI learning points
   - Refine the process for future sessions

3. **Documentation Maintenance**:
   - Regularly update the rules in .cursor/rules/
   - Keep PROGRESS.md and IMPLEMENTATION_ROADMAP.md current
   - Archive completed session documentation

## Documentation Templates

### AI Contributions Section
```markdown
## AI Contributions
- [x] Analyzed file structure to identify related components (date)
- [x] Suggested implementation approach for [feature] (date)
- [x] Created script for [task] (date)
- [x] Identified potential edge cases in [component] (date)
```

### Developer Tasks Section
```markdown
## Developer Tasks
- [ ] Review and approve suggested implementation
- [ ] Test edge cases identified by AI
- [ ] Integrate with existing components
- [ ] Perform final validation
```

## Maintaining Documentation

1. **Regular Updates**:
   - Update rules when project focus or standards change
   - Document new patterns and learning points
   - Archive completed session documentation

2. **Version Control**:
   - Commit documentation changes with meaningful messages
   - Keep documentation in sync with code changes
   - Review documentation during code reviews

3. **Continuous Improvement**:
   - Refine the documentation process based on experience
   - Add new templates as needed
   - Update guidelines based on project evolution

## Last Updated
2024-03-11 