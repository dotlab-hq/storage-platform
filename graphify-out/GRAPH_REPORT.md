# Graph Report - storage-platform  (2026-04-27)

## Corpus Check
- 2495 files · ~2,316,395 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14545 nodes · 45223 edges · 68 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15264 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 235|Community 235]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 321 edges
5. `String()` - 201 edges
6. `jsonStringify()` - 200 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (377): getAgentModelOptions(), parseArguments(), substituteArguments(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), AttachmentMessage(), GenericTaskStatus() (+369 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1089): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), getSettingsWithAllErrors(), appendSystemContext(), axiosGetWithRetry(), applySettingsChange() (+1081 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (610): setMockBillingAccessOverride(), formatTimeLabel(), af(), ef(), ff(), Ja(), lf(), mt() (+602 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (782): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), getAutoBackgroundMs(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+774 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (657): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), listAdminProviderContents(), setAgentColor(), formatTime(), AnimatedClawd() (+649 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (385): AnimatedAsterisk(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), ClassifierCheckingSubtitle(), getBidi() (+377 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (541): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+533 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (383): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent(), ApiKeyStep(), AppStateProvider() (+375 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (491): ActivityManager, normalizePrefix(), toFileEntry(), toFolderEntry(), getDefaultSubagentModel(), getAgentColor(), AgentDetail(), getOverrideSourceLabel() (+483 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (359): createAbortController(), createChildAbortController(), isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName() (+351 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (356): getSessionMessages(), flushAsciicastRecorder(), getSessionRecordingPaths(), renameRecordingForSession(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDynamicSkillAttachments(), resetSentSkillNames() (+348 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (347): getAgentContext(), getSubagentLogName(), isSubagentContext(), normalizeToolInput(), prependUserContext(), count(), createAttachmentMessage(), getDeferredToolsDeltaAttachment() (+339 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (301): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+293 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (146): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), openPath() (+138 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (85): deriveSessionTitle(), computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing() (+77 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (98): useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown(), clampToViewport(), isFileCardTarget() (+90 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (88): finalizeHook(), Byline(), CircularBuffer, getClaudeCodeGuideBasePrompt(), _temp8(), hasEmbeddedSearchTools(), validateBoundedIntEnvVar(), getExploreSystemPrompt() (+80 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (149): consumeInvokingRequestId(), AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent() (+141 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (110): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+102 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (129): extractSandboxViolations(), queryHaiku(), queryWithModel(), clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint() (+121 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (127): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), eagerParseCliFlag(), attributionRestoreStateFromLog(), computeContentHash(), computeFileModificationState() (+119 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (110): loadAgentMemoryPrompt(), collapseReadSearchGroups(), commandAsHint(), countToolUses(), createCollapsedGroup(), createEmptyGroup(), getCollapsibleToolInfo(), getFilePathFromToolInput() (+102 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (64): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), _call(), enhanceTool(), enhanceToolIfNeeded() (+56 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (94): runWithAgentContext(), getMaxBudgetUsdAttachment(), getOutputTokenUsageAttachment(), isAutoModeAllowlistedTool(), getRawUtilization(), getCommands(), calculateContextPercentages(), call() (+86 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (31): BaseTextInput(), ListItem(), OptionMap, renderPlaceholder(), getTextContent(), TwoColumnRow(), _t(), be() (+23 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (77): AddPermissionRules(), ComputerUseAppListPanel(), looksLikeISO8601(), escapeForDiff(), getPatchForDisplay(), DiffFileList(), commitTextField(), handleNavigation() (+69 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (63): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), writeSkillFiles(), buildInlineReference() (+55 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (60): getDiagnosticAttachments(), callIdeRpc(), callMCPTool(), contentContainsImages(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), processMCPResult(), detectCodeIndexingFromMcpServerName() (+52 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (40): getChangedFiles(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), extractIncludePathsFromTokens(), filterInjectedMemoryFiles(), getAllMemoryFilePaths(), getClaudeMds() (+32 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (68): _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode() (+60 more)

### Community 31 - "Community 31"
Cohesion: 0.04
Nodes (30): extractTranscript(), logContainsQuery(), AbortError, BoundedUUIDSet, extractTitleText(), handleIngressMessage(), handleServerControlRequest(), isSDKControlRequest() (+22 more)

### Community 32 - "Community 32"
Cohesion: 0.05
Nodes (49): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+41 more)

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (8): _2, E2, createLinkedTransportPair(), InProcessTransport, handleMessageFromStream(), isSDKMessage(), SdkControlClientTransport, SdkControlServerTransport

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 36 - "Community 36"
Cohesion: 0.39
Nodes (1): oc

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.26
Nodes (12): getRecentReleaseNotesSync(), call(), formatReleaseNotes(), checkForReleaseNotes(), checkForReleaseNotesSync(), fetchAndStoreChangelog(), getAllReleaseNotes(), getChangelogCachePath() (+4 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (4): hasAllScopes(), hasScope(), getFilteredTools(), hasToolAccess()

### Community 44 - "Community 44"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 48 - "Community 48"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 49 - "Community 49"
Cohesion: 0.28
Nodes (6): formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), recollapsePastedContent()

### Community 50 - "Community 50"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 56 - "Community 56"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 57 - "Community 57"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 64 - "Community 64"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

### Community 72 - "Community 72"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 88 - "Community 88"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 90 - "Community 90"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 235 - "Community 235"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 36`** (16 nodes): `oc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 235`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 48`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 30`, `Community 39`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 8` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 30`, `Community 33`, `Community 38`, `Community 48`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 320 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 320 INFERRED edges - model-reasoned connections that need verification._