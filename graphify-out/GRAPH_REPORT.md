# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2407 files · ~2,277,962 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14167 nodes · 44945 edges · 47 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15307 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 188|Community 188]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 318 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (504): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), call(), formatAgent(), AbortError (+496 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (654): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), triggerTrashCron(), runWithAgentContext(), _runAndCache() (+646 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (602): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), AnimatedClawd(), hold() (+594 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (941): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+933 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (816): optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), formatAgentId(), parseAgentId(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI() (+808 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (461): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), memoryHeader(), getBidi(), hasRTLCharacters(), needsBidi() (+453 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (559): isAgentMemoryPath(), logContextMetrics(), generateFileAttachment(), getDiagnosticAttachments(), getDirectoriesToProcess(), getDynamicSkillAttachments(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile() (+551 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (627): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), authLogin(), calculateApiKeyHelperTTL(), _executeApiKeyHelper(), getApiKeyFromApiKeyHelper(), getAuthTokenSource(), getConfiguredApiKeyHelper() (+619 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (598): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+590 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (440): createAbortController(), createChildAbortController(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle() (+432 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (257): checkAndRefreshOAuthTokenIfNeeded(), getAnthropicApiKeyWithSource(), getApiKeyFromApiKeyHelperCached(), hasAnthropicApiKeyAuth(), isCustomApiKeyApproved(), normalizeApiKeyForConfig(), checkBridgePrerequisites(), call() (+249 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (286): formatTime(), axiosGetWithRetry(), logAPIPrefix(), resetSentSkillNames(), AuthenticationCancelledError, authLogout(), checkAndRefreshOAuthTokenIfNeededImpl(), ClaudeAuthProvider (+278 more)

### Community 12 - "Community 12"
Cohesion: 0.02
Nodes (199): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), classifyHandoffIfNeeded(), getAttachments(), getQueuedCommandAttachments(), maybe() (+191 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (164): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+156 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (159): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+151 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (80): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+72 more)

### Community 16 - "Community 16"
Cohesion: 0.03
Nodes (134): preconnectAnthropicApi(), resolveAttachments(), removeClaudeAliasesFromShellConfigs(), shouldSkipVersion(), getNonstreamingFallbackTimeoutMs(), detectConfigurationIssues(), downloadVersion(), downloadVersionFromBinaryRepo() (+126 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (110): checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), getAsyncHookResponseAttachments(), isInstructionsMemoryType(), memoryFilesToAttachments() (+102 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (113): callMCPTool(), contentContainsImages(), getMcpToolTimeoutMs(), inferCompactSchema(), isMcpSessionExpiredError(), persistBlobToTextBlock(), processMCPResult(), transformMCPResult() (+105 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (106): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+98 more)

### Community 21 - "Community 21"
Cohesion: 0.04
Nodes (66): AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent(), formatMessagesForContext() (+58 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (65): registerBatchSkill(), registerBundledSkill(), ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage() (+57 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (66): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), validateUrl() (+58 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (61): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages() (+53 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (60): AddPermissionRules(), getOverrideSourceLabel(), getSourceDisplayName(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601() (+52 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (49): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+41 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (40): AbortController, ByteLengthQueuingStrategy, CloseEvent, CompileError, CompressionStream, CountQueuingStrategy, CustomEvent, DecompressionStream (+32 more)

### Community 30 - "Community 30"
Cohesion: 0.09
Nodes (20): resolveUserId(), mapBreadcrumbs(), mapItems(), handleUpload(), getActiveUploadCount(), updateUpload(), useUploadStore(), completeMultipartUpload() (+12 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (13): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.36
Nodes (10): analyzeCommand(), buildPositionSet(), collectQuoteSpans(), dropContainedSpans(), extractCompoundStructure(), extractDangerousPatterns(), extractQuoteContext(), hasActualOperatorNodes() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 36 - "Community 36"
Cohesion: 0.24
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (3): validateCorsTestCases(), getDefaultCorsConfig(), validateCorsConfig()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 188 - "Community 188"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 36`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 24`, `Community 25`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `logError()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 25`, `Community 31`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._