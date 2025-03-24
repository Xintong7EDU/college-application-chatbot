# College Application Chatbot - Troubleshooting Guide

This document covers common errors encountered in the College Application Chatbot and their solutions.

## Hydration Mismatch Errors

### React Hydration Error

**Error Message:**
```
Error: Hydration failed because the server rendered HTML didn't match the client.
```

**Description:**
This error occurs when there's a difference between the server-side rendered (SSR) HTML and the client-side rendered HTML after hydration. In Next.js applications, components are first rendered on the server and then "hydrated" on the client, and both versions must match exactly.

**Common Causes:**
- Using conditional rendering that depends on client-side state (`isClient` checks)
- Client-specific APIs like `window`, `navigator`, or `localStorage`
- Date formatting that differs between server and client
- Random values or dynamic content that changes between renders

**Solutions:**
1. **Use the `clientOnly` utility function:**
   ```typescript
   // Instead of conditional rendering (causes hydration errors):
   {isClient && <div>Client-only content</div>}
   
   // Use clientOnly utility (prevents hydration errors):
   <div className={clientOnly("base-classes", isClient ? "visible" : "invisible")}>
     Client-only content
   </div>
   ```

2. **Always maintain the same DOM structure:**
   - Render the same elements on both server and client
   - Use CSS to hide/show elements rather than conditional rendering
   - Always include all elements in the DOM, but control visibility with classes

3. **Delay client-specific operations:**
   - Use `useEffect` to run client-only code after hydration
   - Set state values only after component mounts
   - Implement proper guards in `useEffect` dependencies

## Streaming Response Errors

### Message Channel Closure Error

**Error Message:**
```
Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
```

**Description:**
This error occurs when a streaming connection from the OpenAI API is unexpectedly closed before the full response is received. The client side is expecting more data, but the connection terminates prematurely.

**Causes:**
- Network instability or timeouts
- Long response generation times exceeding connection limits
- Browser limitations on connection duration
- Server-side issues with the streaming response

**Solutions:**
1. **Client-side improvements:**
   - Use AbortController for better request control
   - Implement proper error handling for stream reading
   - Add connection timeout handling
   - Properly decode final chunks when stream ends

2. **Server-side improvements:**
   - Add proper headers (`Connection: keep-alive`, `Transfer-Encoding: chunked`)
   - Set appropriate token limits to prevent overly long responses
   - Implement better error logging and recovery
   - Handle stream cancellation explicitly

3. **Graceful Degradation:**
   - Display partial responses when available instead of showing errors
   - Notify users when a response was cut short

## API Rate Limiting

### OpenAI API Rate Limit Errors

**Error Message:**
```
Error: 429 Too Many Requests
```

**Description:**
OpenAI enforces rate limits on API requests. Exceeding these limits will result in request failures.

**Solutions:**
1. Implement request throttling and queueing
2. Add exponential backoff for retries
3. Cache common responses when possible
4. Monitor API usage and adjust accordingly

## Browser Storage Issues

### Storage Quota Exceeded

**Error Message:**
```
QuotaExceededError: The quota has been exceeded
```

**Description:**
Browser storage (localStorage/sessionStorage) has a limited capacity. This error occurs when attempting to store more data than allowed.

**Solutions:**
1. Implement message cleanup (delete old conversations)
2. Compress stored data
3. Use indexed DB for larger storage needs
4. Warn users when approaching storage limits

## Network Issues

### CORS Errors

**Error Message:**
```
Access to fetch at 'https://api.openai.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Description:**
Cross-Origin Resource Sharing (CORS) errors occur when the browser prevents requests to different domains without proper headers.

**Solutions:**
1. Ensure API requests go through your Next.js API routes
2. Configure proper CORS headers on server responses
3. Check for mixed content issues (HTTP vs HTTPS)

## Audio-Related Issues

### Audio Playback Failures

**Error Message:**
```
NotAllowedError: The request is not allowed by the user agent or the platform
```

**Description:**
Audio playback may fail due to browser permissions or unsupported formats.

**Solutions:**
1. Request audio permissions explicitly
2. Provide fallback options when audio can't be played
3. Use widely supported audio formats

## Memory Leaks

### Page Becoming Unresponsive

**Symptoms:**
- Increasing memory usage
- Page slowing down over time
- Browser tab crashes

**Common Causes:**
- Uncleaned event listeners
- Unmanaged stream connections
- Growing state objects without cleanup

**Solutions:**
1. Clean up event listeners in useEffect returns
2. Close streams properly when components unmount
3. Implement proper cleanup in async operations
4. Add memory monitoring during development

## Debugging Tips

1. **Console Logging:**
   ```typescript
   console.log('Starting OpenAI response stream...');
   console.log('Received chunk:', chunk.length, 'bytes');
   console.log('Stream completed successfully');
   ```

2. **Network Tab:**
   - Monitor the network requests in browser dev tools
   - Check for status codes and response times
   - Examine headers for streaming connections

3. **Error Boundaries:**
   - Implement React Error Boundaries to catch and display errors gracefully
   - Provide meaningful error messages to users

4. **Performance Monitoring:**
   - Use browser performance tools to identify bottlenecks
   - Monitor memory usage for potential leaks 