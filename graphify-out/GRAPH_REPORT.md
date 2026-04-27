# Graph Report - storage-platform  (2026-04-28)

## Corpus Check
- 2501 files · ~2,317,911 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14561 nodes · 45271 edges · 63 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15291 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 233|Community 233]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 321 edges
5. `String()` - 203 edges
6. `jsonStringify()` - 200 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (292): getAgentModelOptions(), extractTranscript(), logContainsQuery(), AbortError, getSettingsWithAllErrors(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), collectRecentSuccessfulTools() (+284 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1304): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), isTeammateAgentContext(), agenticSessionSearch() (+1296 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (908): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+900 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (432): formatTime(), normalizeDirectToolCall(), parseFrontmatterPaths(), af(), ef(), ff(), Ja(), lf() (+424 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (560): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+552 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (403): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), BaseTextInput(), getBidi(), hasRTLCharacters(), needsBidi() (+395 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (595): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+587 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (545): logAPIPrefix(), splitSysPromptPrefix(), getOauthAccountInfo(), isProSubscriber(), readClientSecret(), assertMinVersion(), onSelect(), buildCommandParts() (+537 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (448): createAbortController(), createChildAbortController(), getAgentContext(), getSubagentLogName(), isSubagentContext(), countToolUses(), emitTaskProgress(), extractPartialResult() (+440 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (432): getSessionMessages(), createApiQueryHook(), applySettingsChange(), uniq(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths(), getTerminalSize() (+424 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (379): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getDefaultSubagentModel(), isModelAlias() (+371 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (198): registerMcpAddCommand(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDiagnosticAttachments(), resetSentSkillNames(), AuthenticationCancelledError, authLogout(), ClaudeAuthProvider (+190 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (218): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openBrowser() (+210 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (191): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), parseArgumentNames(), parseArguments(), substituteArguments() (+183 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (203): consumeInvokingRequestId(), classifyHandoffIfNeeded(), getAttachments(), getQueuedCommandAttachments(), maybe(), calculateApiKeyHelperTTL(), checkGcpCredentialsValid(), clearApiKeyHelperCache() (+195 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (169): canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), getAutoBackgroundMs(), _temp(), getAutoModeExitAttachment() (+161 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (111): checkAndRefreshOAuthTokenIfNeeded(), CCRClient, CircularBuffer, getMemoryPath(), getHasFormattedOutput(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), classifyAxiosError() (+103 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (101): registerPendingAsyncHook(), getOutputTokenUsageAttachment(), AuthCodeListener, refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, BoundedUUIDSet (+93 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (160): loadAgentMemoryPrompt(), isUsing3PServices(), areExplorePlanAgentsEnabled(), getBuiltInAgents(), getClaudeCodeGuideBasePrompt(), getFeedbackGuideline(), collapseBackgroundBashNotifications(), isCompletedBackgroundBash() (+152 more)

### Community 19 - "Community 19"
Cohesion: 0.01
Nodes (76): validateUrl(), useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), downloadProxyChunk(), downloadViaProxy() (+68 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (46): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+38 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (111): contentContainsImages(), processMCPResult(), escapeForDiff(), getPatchForDisplay(), getPatchFromContents(), _temp8(), validateBoundedIntEnvVar(), addLineNumbers() (+103 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (83): AddPermissionRules(), call(), collectContextData(), formatContextAsMarkdownTable(), checkAutoCompactDisabled(), checkLargeToolResults(), checkMemoryBloat(), checkNearCapacity() (+75 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (82): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage() (+74 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (69): isTransientNetworkError(), buildBridgeConnectUrl(), buildBridgeSessionUrl(), contentToText(), ExitPlanModeScanner, extractApprovedPlan(), extractTeleportPlan(), pollForApprovedExitPlanMode() (+61 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (18): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (53): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), handleUpload(), allocateWeightedConcurrency(), buildFolderPlan(), countDirectoryFiles() (+45 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (45): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+37 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (39): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), isLockHeldLocally() (+31 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (25): getModeFromInput(), getValueFromInput(), getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions() (+17 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 33 - "Community 33"
Cohesion: 0.14
Nodes (11): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (11): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter(), useGauge() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 38 - "Community 38"
Cohesion: 0.26
Nodes (1): SerialBatchEventUploader

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 45 - "Community 45"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 53 - "Community 53"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 54 - "Community 54"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 67 - "Community 67"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 83 - "Community 83"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 233 - "Community 233"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (12 nodes): `SerialBatchEventUploader`, `.close()`, `.constructor()`, `.drain()`, `.droppedBatchCount()`, `.enqueue()`, `.flush()`, `.pendingCount()`, `.releaseBackpressure()`, `.retryDelay()`, `.sleep()`, `.takeBatch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 233`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 28`, `Community 29`, `Community 31`, `Community 32`, `Community 33`, `Community 45`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 13` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 28`, `Community 31`, `Community 45`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 320 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 320 INFERRED edges - model-reasoned connections that need verification._