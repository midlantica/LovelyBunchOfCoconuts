# MCP Troubleshooting Guide

**Last Updated:** November 21, 2025

Solutions to common MCP server issues.

---

## Quick Diagnostics

**Check Server Status:**

- Look at Cline's MCP panel in VS Code
- Green dot = Connected
- Red dot = Error
- Yellow dot = Connecting

**Test Servers:**
Ask Cline: "What MCP servers are connected?"

---

## Common Issues

### Issue 1: Server Not Connecting

**Symptoms:**

- Red dot in MCP panel
- "Connection closed" error
- Server not appearing in list

**Solutions:**

1. **Restart VS Code**

   ```
   Cmd+Q (quit completely)
   Reopen VS Code
   ```

2. **Check Configuration**
   - File: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Verify JSON is valid
   - Check command paths

3. **Verify Package Installation**
   ```bash
   npx -y @modelcontextprotocol/server-filesystem --version
   npx -y @modelcontextprotocol/server-github --version
   ```

---

### Issue 2: GitHub Authentication Failed

**Symptoms:**

- "401 Unauthorized" errors
- "Bad credentials" message
- Can't access private repos

**Solutions:**

1. **Check Token**
   - Verify token in config file
   - Ensure token hasn't expired
   - Check token permissions

2. **Regenerate Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create new token with required scopes:
     - `repo` (full control)
     - `read:org`
     - `read:user`

3. **Update Configuration**
   ```json
   {
     "env": {
       "GITHUB_PERSONAL_ACCESS_TOKEN": "your_new_token_here"
     }
   }
   ```

---

### Issue 3: Figma API Errors

**Symptoms:**

- "404 Not Found" for valid files
- "403 Forbidden" errors
- Can't download images

**Solutions:**

1. **Verify File Key**
   - Open Figma file
   - URL format: `figma.com/file/[FILE_KEY]/...`
   - Copy FILE_KEY exactly

2. **Check API Key**
   - Verify key in config
   - Ensure key hasn't been revoked
   - Check Figma account permissions

3. **Test Access**
   ```
   Tool: get_figma_data
   FileKey: [your-actual-file-key]
   ```

---

### Issue 4: Filesystem Access Denied

**Symptoms:**

- "Permission denied" errors
- Can't read/write files
- "Path not allowed" messages

**Solutions:**

1. **Check Allowed Directory**

   ```
   Tool: list_allowed_directories
   ```

   Should return: `/Users/drew`

2. **Verify Path**
   - Must be within `/Users/drew`
   - Use absolute paths
   - Check file permissions

3. **Fix Permissions**
   ```bash
   chmod 644 /path/to/file  # For files
   chmod 755 /path/to/dir   # For directories
   ```

---

### Issue 5: Rate Limiting

**Symptoms:**

- "Rate limit exceeded" errors
- Slow responses from GitHub
- "Too many requests" messages

**Solutions:**

1. **Wait and Retry**
   - GitHub: 5,000 requests/hour (authenticated)
   - Wait 15-60 minutes

2. **Reduce Request Frequency**
   - Use `per_page` to limit results
   - Cache results when possible
   - Batch operations

3. **Check Rate Limit**
   ```
   Tool: search_repositories
   Query: "test"
   Per Page: 1
   ```
   Response headers show remaining requests

---

## Server-Specific Issues

### Filesystem MCP

**Problem:** Can't find files
**Solution:** Use `search_files` with correct pattern

**Problem:** Large file timeout
**Solution:** Use `head` parameter to read first N lines

**Problem:** Directory not found
**Solution:** Use `list_directory` to verify path

### GitHub MCP

**Problem:** Too many search results
**Solution:** Add filters (language, repo, user)

**Problem:** Can't access private repos
**Solution:** Check token has `repo` scope

**Problem:** Old data returned
**Solution:** GitHub caches for ~60 seconds

### Figma MCP

**Problem:** Can't find node ID
**Solution:** Right-click element in Figma → Copy/Paste as → Copy link

**Problem:** Images not downloading
**Solution:** Check `localPath` exists and is writable

**Problem:** Wrong image size
**Solution:** Adjust `pngScale` parameter (1-4)

---

## Configuration Issues

### Invalid JSON

**Error:** "Unexpected token" or "Parse error"

**Solution:**

1. Open config file
2. Validate JSON at jsonlint.com
3. Common issues:
   - Missing commas
   - Trailing commas
   - Unescaped quotes
   - Missing brackets

### Wrong Server Name

**Error:** Server not found

**Solution:**
Use exact names:

- `github.com/GLips/Figma-Context-MCP`
- `github.com/modelcontextprotocol/servers/tree/main/src/filesystem`
- `github.com/modelcontextprotocol/servers/tree/main/src/github`

### Missing Environment Variables

**Error:** "Environment variable not set"

**Solution:**
Add to server config:

```json
{
  "env": {
    "VARIABLE_NAME": "value"
  }
}
```

---

## Performance Issues

### Slow Responses

**Causes:**

- Large file reads
- Too many search results
- Network latency
- API rate limiting

**Solutions:**

- Use `head` parameter for files
- Limit search results with `per_page`
- Check internet connection
- Verify not rate limited

### High Memory Usage

**Causes:**

- Reading many large files
- Keeping connections open
- Large search results

**Solutions:**

- Read files one at a time
- Restart VS Code periodically
- Limit result sizes

---

## Debugging Steps

### 1. Check Logs

**VS Code Developer Tools:**

```
Help → Toggle Developer Tools → Console
```

Look for:

- Connection errors
- Authentication failures
- Timeout messages

### 2. Test Individual Tools

**Filesystem:**

```
Tool: list_allowed_directories
```

**GitHub:**

```
Tool: search_repositories
Query: "test"
Per Page: 1
```

**Figma:**

```
Tool: get_figma_data
FileKey: [test-key]
```

### 3. Verify Configuration

**Check file exists:**

```bash
ls -la ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**View configuration:**

```bash
cat ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### 4. Reset Configuration

**Backup current:**

```bash
cp ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json ~/cline_mcp_backup.json
```

**Restart from scratch:**

- Remove server entries
- Add back one at a time
- Test after each addition

---

## Getting Help

### Before Asking

1. ✅ Check this troubleshooting guide
2. ✅ Verify configuration is correct
3. ✅ Test with simple operations
4. ✅ Check server logs
5. ✅ Try restarting VS Code

### Information to Provide

When reporting issues, include:

- Error message (exact text)
- Server name
- Tool being used
- Configuration (remove sensitive data)
- VS Code version
- Operating system

### Resources

- **MCP Guide:** `docs/MCP_GUIDE.md`
- **Test Report:** `docs/MCP_SERVERS_TEST_REPORT.md`
- **Cline Docs:** https://docs.cline.bot
- **MCP Spec:** https://modelcontextprotocol.io

---

## Prevention Tips

### Regular Maintenance

1. **Update Packages**

   ```bash
   # Packages auto-update with npx -y
   # No manual updates needed
   ```

2. **Monitor Usage**
   - Watch for rate limit warnings
   - Check API quotas
   - Review error logs

3. **Backup Configuration**
   ```bash
   cp ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json ~/mcp_backup_$(date +%Y%m%d).json
   ```

### Best Practices

- ✅ Use specific search queries
- ✅ Limit result sizes
- ✅ Handle errors gracefully
- ✅ Test with small operations first
- ✅ Keep tokens secure
- ❌ Don't commit tokens to git
- ❌ Don't share API keys
- ❌ Don't make rapid requests

---

## Emergency Reset

If nothing works:

1. **Backup configuration**
2. **Remove all MCP servers from config**
3. **Restart VS Code**
4. **Add servers back one by one**
5. **Test after each addition**

**Nuclear option:**

```bash
# Backup first!
rm ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
# Restart VS Code
# Reconfigure from scratch
```

---

**Still having issues?** Check `docs/MCP_GUIDE.md` for usage examples or review `docs/MCP_SERVERS_TEST_REPORT.md` for expected behavior.
