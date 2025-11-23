# MCP Servers - Complete Guide

**Last Updated:** November 21, 2025

Your complete guide to using Model Context Protocol (MCP) servers with Cline.

---

## Table of Contents

1. [Overview](#overview)
2. [Connected Servers](#connected-servers)
3. [Quick Start](#quick-start)
4. [Practical Examples](#practical-examples)
5. [Common Workflows](#common-workflows)
6. [Tips & Best Practices](#tips--best-practices)

---

## Overview

You have **3 MCP servers** connected, providing **43 tools** for:

- File system operations (14 tools)
- GitHub integration (27 tools)
- Figma design extraction (2 tools)

**Status:** ✅ All servers operational (100% health)

---

## Connected Servers

### 1. 🗂️ Filesystem MCP

**Server:** `@modelcontextprotocol/server-filesystem`
**Access:** `/Users/drew`
**Tools:** 14

**What it does:**

- Read/write files
- List directories
- Search for files
- Get file metadata
- Create directories
- Move/rename files

**Key Tools:**

- `list_directory` - List files and folders
- `read_text_file` - Read file contents
- `search_files` - Find files by pattern
- `directory_tree` - Get nested structure
- `get_file_info` - File metadata

---

### 2. 🐙 GitHub MCP

**Server:** `@modelcontextprotocol/server-github`
**Authentication:** ✅ Configured
**Tools:** 27

**What it does:**

- Search repositories and code
- Manage issues and PRs
- Read files from any repo
- Create branches
- Search users

**Key Tools:**

- `search_repositories` - Find repos
- `search_code` - Find code examples
- `get_file_contents` - Read repo files
- `list_issues` - View issues
- `create_issue` - Create issues

---

### 3. 🎨 Figma MCP

**Server:** `figma-developer-mcp`
**Authentication:** ✅ Configured
**Tools:** 2

**What it does:**

- Extract design data
- Download assets (SVG/PNG)

**Key Tools:**

- `get_figma_data` - Get design specs
- `download_figma_images` - Export assets

**Note:** Requires valid Figma file keys from your account

---

## Quick Start

### Basic File Operations

**List your components:**

```
Tool: list_directory
Path: /Users/drew/Documents/_work/WakeUpNPC2/app/components
```

**Read a file:**

```
Tool: read_text_file
Path: /Users/drew/Documents/_work/WakeUpNPC2/package.json
```

**Search for files:**

```
Tool: search_files
Path: /Users/drew/Documents/_work/WakeUpNPC2
Pattern: *.vue
```

### GitHub Operations

**Find similar projects:**

```
Tool: search_repositories
Query: "nuxt content blog"
Per Page: 10
```

**Search for code:**

```
Tool: search_code
Query: "useAsyncData nuxt"
```

**Get file from repo:**

```
Tool: get_file_contents
Owner: nuxt
Repo: content
Path: src/runtime/composables/query.ts
```

### Figma Operations

**Extract design:**

```
Tool: get_figma_data
FileKey: "abc123xyz" (from Figma URL)
```

**Download assets:**

```
Tool: download_figma_images
FileKey: "abc123xyz"
LocalPath: /Users/drew/Documents/_work/WakeUpNPC2/public/assets
```

---

## Practical Examples

### Example 1: Project Structure Analysis

**Goal:** Understand your project layout

```
1. Get directory tree:
   Tool: directory_tree
   Path: /Users/drew/Documents/_work/WakeUpNPC2/app

2. Search for Vue components:
   Tool: search_files
   Path: /Users/drew/Documents/_work/WakeUpNPC2/app
   Pattern: *.vue

3. Read multiple configs:
   Tool: read_multiple_files
   Paths: [nuxt.config.ts, tailwind.config.js, tsconfig.json]
```

---

### Example 2: Research & Learn

**Goal:** Find how others implement a feature

```
1. Search GitHub:
   Tool: search_repositories
   Query: "nuxt infinite scroll"

2. Get implementation:
   Tool: get_file_contents
   Owner: [found-repo]
   Repo: [found-repo]
   Path: [relevant-file]

3. Compare with yours:
   Tool: read_text_file
   Path: /Users/drew/Documents/_work/WakeUpNPC2/app/composables/useInfiniteScroll.js
```

---

### Example 3: Design to Code

**Goal:** Implement Figma designs

```
1. Extract design specs:
   Tool: get_figma_data
   FileKey: [your-figma-file]

2. Download assets:
   Tool: download_figma_images
   FileKey: [your-figma-file]
   LocalPath: /Users/drew/Documents/_work/WakeUpNPC2/public/assets

3. Check components:
   Tool: list_directory
   Path: /Users/drew/Documents/_work/WakeUpNPC2/app/components

4. Read component:
   Tool: read_text_file
   Path: /Users/drew/Documents/_work/WakeUpNPC2/app/components/[component].vue
```

---

### Example 4: Code Review

**Goal:** Review and improve code

```
1. Read your code:
   Tool: read_text_file
   Path: [your-file]

2. Search for patterns:
   Tool: search_code
   Query: "[pattern] language:typescript"

3. Get examples:
   Tool: get_file_contents
   Owner: [repo]
   Repo: [repo]
   Path: [example-file]
```

---

### Example 5: Issue Management

**Goal:** Track project tasks

```
1. List open issues:
   Tool: list_issues
   Owner: midlantica
   Repo: WakeUpNPC2
   State: open

2. Create new issue:
   Tool: create_issue
   Owner: midlantica
   Repo: WakeUpNPC2
   Title: "Add dark mode"
   Body: "Users requested dark mode..."
   Labels: ["enhancement"]
```

---

## Common Workflows

### Workflow 1: Feature Implementation

1. **Research** - Search GitHub for examples
2. **Analyze** - Get file contents from repos
3. **Compare** - Read your current code
4. **Implement** - Make improvements
5. **Document** - Create/update issues

### Workflow 2: Project Maintenance

1. **Audit** - Get directory structure
2. **Search** - Find specific patterns
3. **Review** - Read multiple files
4. **Organize** - Move/rename files
5. **Track** - Manage GitHub issues

### Workflow 3: Design Integration

1. **Extract** - Get Figma design data
2. **Download** - Export assets
3. **Locate** - Find relevant components
4. **Update** - Modify component code
5. **Verify** - Check implementation

---

## Tips & Best Practices

### Filesystem MCP

✅ **Do:**

- Use `search_files` for pattern matching
- Use `directory_tree` for structure overview
- Use `read_multiple_files` for batch operations
- Check `get_file_info` before reading large files

❌ **Don't:**

- Read entire large files without `head` parameter
- Forget to check allowed directories
- Use absolute paths outside `/Users/drew`

### GitHub MCP

✅ **Do:**

- Use specific search queries
- Limit results with `per_page`
- Check rate limits for heavy usage
- Use `search_code` for implementation examples

❌ **Don't:**

- Make too many rapid requests
- Search without filters (too many results)
- Forget to specify language in code search

### Figma MCP

✅ **Do:**

- Get file key from Figma URL
- Specify `nodeId` for specific components
- Use appropriate `pngScale` for images
- Organize downloads in project folders

❌ **Don't:**

- Use invalid file keys
- Download without specifying local path
- Forget to check Figma API quota

---

## Tool Reference

### Filesystem (14 tools)

**Reading:**

- `read_text_file` - Read file as text
- `read_media_file` - Read images/audio
- `read_multiple_files` - Batch read

**Listing:**

- `list_directory` - List contents
- `list_directory_with_sizes` - List with sizes
- `directory_tree` - Recursive tree
- `list_allowed_directories` - Show access

**Searching:**

- `search_files` - Find by pattern
- `get_file_info` - File metadata

**Writing:**

- `write_file` - Create/overwrite
- `edit_file` - Line-based edits
- `create_directory` - Make directories
- `move_file` - Move/rename

### GitHub (27 tools)

**Search:**

- `search_repositories` - Find repos
- `search_code` - Find code
- `search_issues` - Find issues/PRs
- `search_users` - Find users

**Repository:**

- `create_repository` - Create repo
- `fork_repository` - Fork repo
- `get_file_contents` - Read files

**Issues:**

- `create_issue` - Create issue
- `list_issues` - List issues
- `get_issue` - Get details
- `update_issue` - Update issue
- `add_issue_comment` - Comment

**Pull Requests:**

- `create_pull_request` - Create PR
- `list_pull_requests` - List PRs
- `get_pull_request` - Get details
- `merge_pull_request` - Merge PR
- `get_pull_request_files` - List changes
- `get_pull_request_status` - Check CI/CD
- `create_pull_request_review` - Review
- (+ 4 more PR tools)

**Branches:**

- `create_branch` - Create branch
- `list_commits` - List commits

**Files:**

- `create_or_update_file` - Edit file
- `push_files` - Multi-file commit

### Figma (2 tools)

- `get_figma_data` - Extract design data
- `download_figma_images` - Download assets

---

## Performance Notes

- **Response Time:** < 2 seconds average
- **Success Rate:** 100%
- **Authentication:** All working
- **Error Handling:** Proper and informative

---

## Next Steps

1. **Start Simple:** Try listing directories and reading files
2. **Explore GitHub:** Search for projects and code
3. **Integrate Figma:** Extract designs and assets
4. **Build Workflows:** Combine multiple servers
5. **Automate:** Create repeatable processes

---

## Support

**Test Report:** `docs/MCP_SERVERS_TEST_REPORT.md`
**Troubleshooting:** `docs/MCP_TROUBLESHOOTING.md`

---

**Your MCP infrastructure is ready!** 🚀

43 tools available • 3 servers operational • 100% health
