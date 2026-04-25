# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2454 files · ~2,303,103 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14432 nodes · 44975 edges · 72 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15120 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 242|Community 242]]

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
Nodes (369): getAgentModelOptions(), extractTranscript(), logContainsQuery(), parseArguments(), substituteArguments(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage() (+361 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1534): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), readJsonFile() (+1526 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (441): formatTime(), normalizeDirectToolCall(), af(), ef(), ff(), Ja(), lf(), mt() (+433 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (644): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+636 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (552): getAgentModelDisplay(), getAgentColor(), AgentDetail(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent() (+544 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (695): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+687 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (397): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+389 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (551): createAbortController(), createChildAbortController(), runWithAgentContext(), isAgentMemoryPath(), getSessionMessages(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths() (+543 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (503): isTransientNetworkError(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+495 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (231): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), getSwarmSocketName(), isInITerm2(), isInsideTmux() (+223 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (218): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getAutoModeDenials(), buildDeepLinkBanner() (+210 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (181): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), getAgentPendingMessageAttachments() (+173 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (230): normalizeToolInput(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments() (+222 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (124): registerPendingAsyncHook(), getOutputTokenUsageAttachment(), AuthCodeListener, refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, getChannelAllowlist() (+116 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (152): AbortError, generateFileAttachment(), tryGetPDFReference(), BaseTextInput(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), transformResultContent() (+144 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (96): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+88 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (145): getAgentContext(), getSubagentLogName(), isSubagentContext(), prependUserContext(), suppressNextSkillListing(), Byline(), getCommandName(), findCommand() (+137 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (82): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getModifiers() (+74 more)

### Community 18 - "Community 18"
Cohesion: 0.01
Nodes (88): deleteProvider(), isNotFoundPayload(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), assertMinVersion(), _call() (+80 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (136): consumeInvokingRequestId(), onSelect(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent() (+128 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (115): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+107 more)

### Community 21 - "Community 21"
Cohesion: 0.04
Nodes (77): registerMcpAddCommand(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata(), getMcpClientConfig() (+69 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (84): AddPermissionRules(), call(), collectContextData(), formatContextAsMarkdownTable(), checkAutoCompactDisabled(), checkLargeToolResults(), checkMemoryBloat(), checkNearCapacity() (+76 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (102): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+94 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (77): registerBatchSkill(), clearBuiltinPlugins(), getBuiltinPluginDefinition(), getBuiltinPlugins(), getBuiltinPluginSkillCommands(), isBuiltinPluginId(), registerBuiltinPlugin(), skillDefinitionToCommand() (+69 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (104): _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode() (+96 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (70): getDiagnosticAttachments(), callIdeRpc(), callMCPTool(), callMCPToolWithUrlElicitationRetry(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), detectCodeIndexingFromMcpServerName(), ComputerUseAppListPanel() (+62 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (21): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (32): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), stripHtmlComments(), stripHtmlCommentsFromTokens(), startSignalPolling() (+24 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (47): getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), bootstrapTelemetry(), getBigQueryExportingReader() (+39 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+39 more)

### Community 32 - "Community 32"
Cohesion: 0.06
Nodes (47): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+39 more)

### Community 33 - "Community 33"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 34 - "Community 34"
Cohesion: 0.06
Nodes (42): getOpenedFileFromIDE(), getSelectedLinesFromIDE(), isFileReadDenied(), checkIdeConnection(), cleanupStaleIdeLockfiles(), detectIDEs(), detectRunningIDEs(), detectRunningIDEsCached() (+34 more)

### Community 35 - "Community 35"
Cohesion: 0.1
Nodes (36): getSettingsWithAllErrors(), getLargeMemoryFiles(), addCleanupResults(), cleanupNpmCacheForAnthropicPackages(), cleanupOldDebugLogs(), cleanupOldFileHistoryBackups(), cleanupOldFilesInDirectory(), cleanupOldMessageFiles() (+28 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 37 - "Community 37"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 39 - "Community 39"
Cohesion: 0.13
Nodes (10): getExistingClaudeSubscription(), _temp2(), useCanSwitchToExistingSubscription(), useChromeExtensionNotification(), _temp2(), useInstallMessages(), _temp(), useModelMigrationNotifications() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 48 - "Community 48"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 50 - "Community 50"
Cohesion: 0.31
Nodes (8): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages()

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 54 - "Community 54"
Cohesion: 0.39
Nodes (6): detectFromColorFgBg(), getSystemThemeName(), hexComponent(), parseOscRgb(), resolveThemeSetting(), themeFromOscColor()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 58 - "Community 58"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 59 - "Community 59"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 72 - "Community 72"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 73 - "Community 73"
Cohesion: 0.4
Nodes (3): AntSlowLogger, callerFrame(), addSlowOperation()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 81 - "Community 81"
Cohesion: 0.5
Nodes (1): handleOrchestratedAgentStream()

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 85 - "Community 85"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 91 - "Community 91"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 93 - "Community 93"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (2): getRelativeMemoryPath(), MemoryUpdateNotification()

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 242 - "Community 242"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 33`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `extractReasoningChunks()`, `handleOrchestratedAgentStream()`, `messageContentToText()`, `-orchestrated-stream-handler.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (3 nodes): `MemoryUpdateNotification.tsx`, `getRelativeMemoryPath()`, `MemoryUpdateNotification()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 242`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 35`, `Community 36`, `Community 46`, `Community 73`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 42`, `Community 50`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 12`, `Community 15`, `Community 29`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._