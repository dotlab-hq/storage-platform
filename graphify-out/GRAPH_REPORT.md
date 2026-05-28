# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2431 files · ~2,281,931 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14225 nodes · 45034 edges · 49 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15349 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 203|Community 203]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 318 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 193 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (373): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), formatAgent(), getSettingsWithAllErrors(), uniq() (+365 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1021): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, deleteProvider(), resetProviderForm(), startEditingProvider() (+1013 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1043): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), countSkillTokens(), countSlashCommandTokens(), countTokensWithFallback(), countToolDefinitionTokens(), findSkillTool() (+1035 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (454): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+446 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (731): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+723 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (415): AnimatedAsterisk(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), BaseTextInput(), ClassifierCheckingSubtitle(), extractSandboxViolations() (+407 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (508): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), ApiKeyStep(), AppStateProvider(), useAppState() (+500 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (491): createAbortController(), createChildAbortController(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle() (+483 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (303): formatTime(), logAPIPrefix(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths(), getTerminalSize(), installAsciicastRecorder(), renameRecordingForSession() (+295 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (338): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), ChromeMessageReader, ChromeNativeHost, log() (+330 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (246): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), AbortError, axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession() (+238 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (315): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+307 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (224): loadAgentMemoryPrompt(), checkAndRefreshOAuthTokenIfNeeded(), clearApiKeyHelperCache(), clearAwsCredentialsCache(), clearGcpCredentialsCache(), isEnterpriseSubscriber(), isAwsCredentialsProviderError(), clearCACertsCache() (+216 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (306): getAttachments(), getQueuedCommandAttachments(), getUltrathinkEffortAttachment(), maybe(), calculateApiKeyHelperTTL(), checkGcpCredentialsValid(), _executeApiKeyHelper(), getApiKeyFromApiKeyHelper() (+298 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (269): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+261 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (178): getValue(), withDiagnosticsTiming(), releasePressed(), withModifiers(), withStatsCacheLock(), _a, aa, Ai() (+170 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (140): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+132 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (99): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+91 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (75): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+67 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (132): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), suppressNextSkillListing(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes() (+124 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (127): isTeammateAgentContext(), call(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), _temp(), getDefaultAppState(), TaskStatusMessage() (+119 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (91): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+83 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (43): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments() (+35 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (70): contentContainsImages(), processMCPResult(), _temp8(), validateBoundedIntEnvVar(), createImageResponse(), readImageWithTokenBudget(), asImageFilePath(), getClipboardCommands() (+62 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (67): AddPermissionRules(), getOverrideSourceLabel(), getSourceDisplayName(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation() (+59 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (76): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), getCachedRepository(), getGitDir(), fetchGitDiff(), fetchGitDiffHunks() (+68 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (80): classifyHandoffIfNeeded(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules(), getBashPromptDenyDescriptions(), createChannelPermissionCallbacks() (+72 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (46): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+38 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (12): getExistingClaudeSubscription(), _temp2(), useCanSwitchToExistingSubscription(), useChromeExtensionNotification(), _temp2(), useInstallMessages(), _temp(), useModelMigrationNotifications() (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 36 - "Community 36"
Cohesion: 0.2
Nodes (5): useS3ViewerDelete(), useS3ViewerFolder(), useS3ViewerQuery(), useS3ViewerUpload(), useS3BucketViewer()

### Community 37 - "Community 37"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 41 - "Community 41"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (1): SentryErrorBoundary

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 203 - "Community 203"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 39`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `SentryErrorBoundary`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 203`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 28`, `Community 31`, `Community 32`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 24`, `Community 25`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._