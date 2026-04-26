# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2465 files · ~2,308,404 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14452 nodes · 44994 edges · 64 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15135 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 228|Community 228]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 312 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 196 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `saveCurrentSessionCosts()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\config.ts
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (527): isTeammateAgentContext(), extractTranscript(), logContainsQuery(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), createApiQueryHook(), useAppStateMaybeOutsideOfProvider() (+519 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (986): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), appendSystemContext(), axiosGetWithRetry(), AppStateProvider(), parseArgumentNames() (+978 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (487): formatTime(), setMockBillingAccessOverride(), normalizeDirectToolCall(), handleScroll(), scrollToBottom(), formatTimeLabel(), transformResultContent(), af() (+479 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (802): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+794 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (728): createAbortController(), createChildAbortController(), ActivityManager, getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel(), resolveAgentModelDisplay() (+720 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (400): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+392 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (519): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry() (+511 more)

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (403): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent(), getSettingsWithAllErrors(), AnimatedAsterisk() (+395 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (290): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession(), getCodeWebUrl() (+282 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (346): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+338 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (256): formatAgentId(), parseAgentId(), getDefaultAppState(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), createEmptyAttributionState(), getClientSurface() (+248 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (285): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+277 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (226): isAgentMemoryPath(), isClmAllowedType(), normalizeTypeName(), companionUserId(), getCompanion(), hashString(), mulberry32(), pick() (+218 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (224): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), buildDeepLinkBanner(), mtimeOrUndefined() (+216 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (226): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), logAPIPrefix(), splitSysPromptPrefix(), assertMinVersion(), onSelect() (+218 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (138): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), decodeFont(), encodePng(), fillBackground() (+130 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (146): AbortError, AutoUpdater(), BaseTextInput(), BoundedUUIDSet, handleIngressMessage(), handleServerControlRequest(), isSDKControlRequest(), isSDKControlResponse() (+138 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (141): registerMcpAddCommand(), InvalidApiKeyMessage(), AuthenticationCancelledError, authLogout(), checkAndRefreshOAuthTokenIfNeededImpl(), ClaudeAuthProvider, clearMcpClientConfig(), clearOAuthTokenCache() (+133 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (150): applySettingsChange(), getSubscriptionName(), verifyApiKey(), callMCPToolWithUrlElicitationRetry(), getValue(), runElicitationHooks(), runElicitationResultHooks(), execHttpHook() (+142 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (83): BackgroundTask(), deriveSessionTitle(), abbreviateActivity(), computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar() (+75 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (140): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getConfig() (+132 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (105): checkAndRefreshOAuthTokenIfNeeded(), notifyChange(), getMemoryPath(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), classifyAxiosError(), getGithubRepo(), applyRemoteEntriesToLocal() (+97 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (88): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+80 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (78): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+70 more)

### Community 24 - "Community 24"
Cohesion: 0.02
Nodes (67): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), createLocalFallbackReply(), generateAssistantReply(), useChatShellActions() (+59 more)

### Community 25 - "Community 25"
Cohesion: 0.02
Nodes (79): validateUrl(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown(), clampToViewport(), isFileCardTarget() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.02
Nodes (39): finalizeHook(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, fanOut(), CircularBuffer, clearPendingHint() (+31 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (106): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent() (+98 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (23): OptionMap, _t(), ce, ct(), de, Ee(), fe(), ge() (+15 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (50): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+42 more)

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (36): AddPermissionRules(), CollapseStatus(), FileReadCache, extractMarkupText(), formatCallHierarchyItem(), formatDocumentSymbolNode(), formatDocumentSymbolResult(), formatFindReferencesResult() (+28 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (40): addCleanupResults(), cleanupNpmCacheForAnthropicPackages(), cleanupOldDebugLogs(), cleanupOldFileHistoryBackups(), cleanupOldFilesInDirectory(), cleanupOldMessageFiles(), cleanupOldMessageFilesInBackground(), cleanupOldPlanFiles() (+32 more)

### Community 33 - "Community 33"
Cohesion: 0.07
Nodes (14): fireRawRead(), startMdmRawRead(), generateSettingsJSONSchema(), consumeRawReadResult(), ensureMdmSettingsLoaded(), parseCommandOutputAsSettings(), parseRegQueryStdout(), refreshMdmSettings() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled(), runFilePersistence(), buildDownloadPath() (+24 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (29): envSessionKind(), getSessionsDir(), isBgSession(), registerSession(), updatePidFile(), updateSessionActivity(), updateSessionBridgeId(), updateSessionName() (+21 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 37 - "Community 37"
Cohesion: 0.1
Nodes (11): getDiagnosticAttachments(), callIdeRpc(), callMCPTool(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), detectCodeIndexingFromMcpServerName(), DiagnosticTrackingService, pathsEqual() (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 39 - "Community 39"
Cohesion: 0.39
Nodes (1): oc

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 42 - "Community 42"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 46 - "Community 46"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 53 - "Community 53"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 54 - "Community 54"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 68 - "Community 68"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 72 - "Community 72"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 86 - "Community 86"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 228 - "Community 228"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 39`** (16 nodes): `oc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 228`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 26`, `Community 27`, `Community 30`, `Community 31`, `Community 32`, `Community 34`, `Community 35`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 26`, `Community 27`, `Community 35`, `Community 37`, `Community 41`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 27`, `Community 28`, `Community 31`, `Community 32`, `Community 37`, `Community 53`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 311 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 311 INFERRED edges - model-reasoned connections that need verification._