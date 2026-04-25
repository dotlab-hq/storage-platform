# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2454 files · ~2,303,342 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14432 nodes · 44973 edges · 76 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15118 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 130|Community 130]]
- [[_COMMUNITY_Community 246|Community 246]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 311 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `qC()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (364): getAgentModelOptions(), extractTranscript(), logContainsQuery(), parseArguments(), substituteArguments(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage() (+356 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1412): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), readJsonFile() (+1404 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (447): formatTime(), getProjectDir(), sanitizePath(), normalizeDirectToolCall(), af(), ef(), ff(), Ja() (+439 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (636): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+628 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (679): createAbortController(), createChildAbortController(), getAgentColor(), isTeammateAgentContext(), runWithAgentContext(), AgentDetail(), getActualRelativeAgentFilePath(), getLocalAgentMemoryDir() (+671 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (530): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+522 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (394): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), shouldSkipVersion(), getBidi(), hasRTLCharacters() (+386 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (635): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+627 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (448): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+440 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (228): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getSwarmSocketName(), isInITerm2(), isInsideTmux(), isInsideTmuxSync() (+220 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (264): normalizeToolInput(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments() (+256 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (186): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), getAutoModeDenials() (+178 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (198): getAgentContext(), getSubagentLogName(), isSubagentContext(), getTaskReminderTurnCounts(), getTodoReminderAttachments(), getTodoReminderTurnCounts(), suppressNextSkillListing(), Byline() (+190 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (177): consumeInvokingRequestId(), AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent() (+169 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (100): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+92 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (152): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getUnifiedTaskAttachments() (+144 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (137): generateFileAttachment(), tryGetPDFReference(), BaseTextInput(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), transformResultContent(), getFileModificationTimeAsync() (+129 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (74): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+66 more)

### Community 18 - "Community 18"
Cohesion: 0.01
Nodes (86): deleteProvider(), isNotFoundPayload(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), assertMinVersion(), _call() (+78 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (61): getOverrideSourceLabel(), resolveAgentOverrides(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath() (+53 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (106): AddPermissionRules(), ComputerUseAppListPanel(), ComputerUseTccPanel(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601() (+98 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (125): getAgentMemoryDir(), getAgentMemoryEntrypoint(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent(), getSnapshotJsonPath() (+117 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (112): classifyHandoffIfNeeded(), getOutputTokenUsageAttachment(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules(), getBashPromptDenyDescriptions() (+104 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (107): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+99 more)

### Community 24 - "Community 24"
Cohesion: 0.05
Nodes (68): registerMcpAddCommand(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata(), getMcpClientConfig() (+60 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (42): finalizeHook(), CircularBuffer, buildAuthUrl(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue() (+34 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (56): registerPendingAsyncHook(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, CCRClient, getChannelAllowlist(), isChannelAllowlisted() (+48 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (79): getDefaultAppState(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), attributionRestoreStateFromLog(), computeContentHash(), computeFileModificationState() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (39): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), isClaudeMdExcluded(), resolveExcludePatterns(), stripHtmlComments() (+31 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (74): applySettingsChange(), _temp(), getAutoModeExitAttachment(), isAutoModeActive(), setAutoModeActive(), EnterPlanModePermissionRequest(), handleEmptyPlanResponse(), handleResponse() (+66 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+39 more)

### Community 32 - "Community 32"
Cohesion: 0.04
Nodes (24): AbortError, isTransientNetworkError(), contentToText(), ExitPlanModeScanner, extractApprovedPlan(), extractTeleportPlan(), pollForApprovedExitPlanMode(), UltraplanPollError (+16 more)

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (47): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+39 more)

### Community 34 - "Community 34"
Cohesion: 0.06
Nodes (39): InputEvent, parseKey(), KeybindingSetup(), useKeybindingWarnings(), loadKeybindingsSync(), getInkModifiers(), getKeyName(), matchesBinding() (+31 more)

### Community 35 - "Community 35"
Cohesion: 0.07
Nodes (28): loadAgentsFromDirectory(), collectMarkdownFiles(), getCommandNameFromFile(), isSkillFile(), loadCommandsFromDirectory(), transformPluginSkillFiles(), loadOutputStylesFromDirectory(), copyTextOf() (+20 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (31): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+23 more)

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (32): getSettingsWithAllErrors(), getLargeMemoryFiles(), addCleanupResults(), cleanupNpmCacheForAnthropicPackages(), cleanupOldDebugLogs(), cleanupOldFileHistoryBackups(), cleanupOldFilesInDirectory(), cleanupOldMessageFiles() (+24 more)

### Community 39 - "Community 39"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 41 - "Community 41"
Cohesion: 0.15
Nodes (9): getPluginErrorMessage(), formatErrorMessage(), getErrorGuidance(), buildErrorRows(), buildMarketplaceAction(), buildPluginAction(), getExtraMarketplaceSourceInfo(), getPluginNameFromError() (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (4): filterToolsForAgent(), getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 45 - "Community 45"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 46 - "Community 46"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

### Community 52 - "Community 52"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 54 - "Community 54"
Cohesion: 0.31
Nodes (8): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages()

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 57 - "Community 57"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 60 - "Community 60"
Cohesion: 0.39
Nodes (6): detectFromColorFgBg(), getSystemThemeName(), hexComponent(), parseOscRgb(), resolveThemeSetting(), themeFromOscColor()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 63 - "Community 63"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 64 - "Community 64"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 76 - "Community 76"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 77 - "Community 77"
Cohesion: 0.4
Nodes (3): AntSlowLogger, callerFrame(), addSlowOperation()

### Community 81 - "Community 81"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 85 - "Community 85"
Cohesion: 0.5
Nodes (1): detectCodeIndexingFromMcpServerName()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 95 - "Community 95"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 97 - "Community 97"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (2): getRelativeMemoryPath(), MemoryUpdateNotification()

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 246 - "Community 246"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 56`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `codeIndexing.ts`, `detectCodeIndexingFromCommand()`, `detectCodeIndexingFromMcpServerName()`, `detectCodeIndexingFromMcpTool()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `MemoryUpdateNotification.tsx`, `getRelativeMemoryPath()`, `MemoryUpdateNotification()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 246`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 30`, `Community 31`, `Community 32`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 49`, `Community 77`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 24`, `Community 30`, `Community 32`, `Community 35`, `Community 36`, `Community 45`, `Community 54`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 2` to `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 10`, `Community 14`, `Community 28`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._