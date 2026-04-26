# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2466 files · ~2,309,048 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14454 nodes · 44995 edges · 56 communities detected
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
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 220|Community 220]]

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
- `saveCurrentSessionCosts()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\config.ts
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (757): getAgentColor(), setAgentColor(), getAgentContext(), getSubagentLogName(), isSubagentContext(), isTeammateAgentContext(), AgentDetail(), AgentEditor() (+749 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (790): getAutoBackgroundMs(), analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens() (+782 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1157): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), axiosGetWithRetry(), prependUserContext(), parseArgumentNames(), registerPendingAsyncHook() (+1149 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (665): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), registerMcpAddCommand(), listAdminProviderContents(), normalizePrefix(), toFileEntry() (+657 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (437): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+429 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (740): createAbortController(), createChildAbortController(), ActivityManager, getOverrideSourceLabel(), resolveAgentModelDisplay(), resolveAgentOverrides(), extractTranscript(), logContainsQuery() (+732 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (459): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+451 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (590): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+582 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (368): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getDefaultAppState(), isInstructionsMemoryType() (+360 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (302): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), AbortError, createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+294 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (328): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+320 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (158): checkAndRefreshOAuthTokenIfNeeded(), getAnthropicApiKeyWithSource(), getApiKeyFromApiKeyHelperCached(), handleOAuth401Error(), handleOAuth401ErrorImpl(), hasAnthropicApiKeyAuth(), getApiKeyFromFileDescriptor(), accumulateStreamEvents() (+150 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (234): clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDynamicSkillAttachments(), resetSentSkillNames(), clearOAuthTokenCache(), invalidateOAuthCacheIfDiskChanged(), clearSpeculativeChecks(), clearBetasCaches() (+226 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (164): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox() (+156 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (130): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), getUserFromApiKey(), hasChatCompletionsScope(), loadAuth() (+122 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (112): useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), collectListeners(), Dispatcher, getEventPriority() (+104 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (144): classifyMcpToolForCollapse(), normalize(), clearClaudeAIMcpConfigsCache(), hasClaudeAiMcpEverConnected(), areMcpConfigsEqual(), callMCPTool(), clearMcpAuthCache(), contentContainsImages() (+136 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (134): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+126 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (113): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+105 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (81): getSettingsWithAllErrors(), addCleanupResults(), cleanupNpmCacheForAnthropicPackages(), cleanupOldDebugLogs(), cleanupOldFileHistoryBackups(), cleanupOldFilesInDirectory(), cleanupOldMessageFiles(), cleanupOldMessageFilesInBackground() (+73 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (77): getDiagnosticAttachments(), AutoUpdater(), callIdeRpc(), DiagnosticTrackingService, normalizePathForComparison(), pathsEqual(), checkIdeConnection(), cleanupStaleIdeLockfiles() (+69 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (64): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+56 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (67): onSessionTimeout(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), getAllSocketPaths(), getAllWindowsRegistryKeys() (+59 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (61): AddPermissionRules(), looksLikeISO8601(), DiffFileList(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync() (+53 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.06
Nodes (61): count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled(), runFilePersistence(), buildDownloadPath() (+53 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (8): finalizeHook(), CircularBuffer, prependStderr(), ShellCommandImpl, StreamWrapper, safeJoinLines(), TaskOutput, getTaskOutputData()

### Community 29 - "Community 29"
Cohesion: 0.08
Nodes (9): fromJsonTimestamp(), fromTimestamp(), FirstPartyEventLoggingExporter, getAxiosErrorContext(), getStorageDir(), fromJsonTimestamp(), fromTimestamp(), stripProtoFields() (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (28): getCommands(), computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), getCronJitterConfig(), createCronScheduler(), addCronTask() (+20 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (13): companionUserId(), getCompanion(), hashString(), mulberry32(), pick(), roll(), rollFrom(), rollRarity() (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (13): getCommandName(), getCommand(), applyCommandSuggestion(), createCommandSuggestionItem(), findSlashCommandPositions(), formatCommand(), generateCommandSuggestions(), getBestCommandMatch() (+5 more)

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (14): getApiKeyHelperSources(), getAwsCommandsSources(), getBashPermissionSources(), getDangerousEnvVarsSources(), getGcpCommandsSources(), getHooksSources(), getOtelHeadersHelperSources(), hasApiKeyHelper() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (2): getAgentThemeColor(), _temp8()

### Community 36 - "Community 36"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 39 - "Community 39"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 43 - "Community 43"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 44 - "Community 44"
Cohesion: 0.28
Nodes (3): GeneralAgent, StorageAgent, createWorkerNode()

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 48 - "Community 48"
Cohesion: 0.52
Nodes (6): findKeywordTriggerPositions(), findUltraplanTriggerPositions(), findUltrareviewTriggerPositions(), hasUltraplanKeyword(), hasUltrareviewKeyword(), replaceUltraplanKeyword()

### Community 49 - "Community 49"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 65 - "Community 65"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 220 - "Community 220"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 27`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (14 nodes): `AgentPill()`, `getAgentThemeColor()`, `SummaryPill()`, `_temp()`, `_temp0()`, `_temp1()`, `_temp2()`, `_temp4()`, `_temp5()`, `_temp6()`, `_temp7()`, `_temp8()`, `_temp9()`, `BackgroundTaskStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 220`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 26`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 28`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 311 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 311 INFERRED edges - model-reasoned connections that need verification._