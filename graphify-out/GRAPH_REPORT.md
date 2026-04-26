# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2466 files · ~2,309,294 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14458 nodes · 45014 edges · 63 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15141 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 227|Community 227]]

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
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (577): getAgentModelOptions(), extractTranscript(), logContainsQuery(), getSettingsWithAllErrors(), splitSysPromptPrefix(), createApiQueryHook(), _temp(), parseArguments() (+569 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (727): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep() (+719 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1196): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), countTokensWithFallback(), appendSystemContext(), axiosGetWithRetry(), preconnectAnthropicApi() (+1188 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (449): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+441 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (621): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry() (+613 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (596): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), AbortError, getAutoBackgroundMs(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession() (+588 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (623): createAbortController(), createChildAbortController(), ActivityManager, getAgentColor(), runWithAgentContext(), AgentDetail(), resolveAgentOverrides(), getActualRelativeAgentFilePath() (+615 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (368): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+360 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (364): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getDefaultSubagentModel(), isModelAlias() (+356 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (334): isAgentMemoryPath(), resolveAttachments(), bashToolCheckCommandOperatorPermissions(), buildSegmentWithoutRedirections(), checkCommandOperatorPermissions(), segmentedCommandPermissionResult(), ensureParserInitialized(), getParserModule() (+326 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (384): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), analyzeContextUsage(), countBuiltInToolTokens() (+376 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (235): formatTime(), generateFileAttachment(), tryGetPDFReference(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch() (+227 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (288): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), validateAttachmentPaths() (+280 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (227): isTeammateAgentContext(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), getDefaultAppState(), TaskStatusMessage(), getAttachments() (+219 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (171): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), onSelect(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes() (+163 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (160): classifyHandoffIfNeeded(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+152 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (85): validateUrl(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), collectListeners(), Dispatcher, getEventPriority() (+77 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (76): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), assertMinVersion(), BypassPermissionsModeDialog(), _temp() (+68 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (109): registerMcpAddCommand(), canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), getAutoModeExitAttachment(), isAutoModeActive() (+101 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (96): getDiagnosticAttachments(), getDynamicSkillAttachments(), resetSentSkillNames(), clearSpeculativeChecks(), clearBetaTracingState(), clearSessionCaches(), dispose(), resetForTesting() (+88 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (79): getOverrideSourceLabel(), resolveAgentModelDisplay(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath() (+71 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (85): registerBatchSkill(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage(), processContent(), registerClaudeApiSkill() (+77 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (70): AddPermissionRules(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync(), setField() (+62 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (60): ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), getAllSocketPaths(), getSecureSocketPath() (+52 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.05
Nodes (60): contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), transformResultContent(), getWebFetchUserAgent(), extensionForMimeType(), getBinaryBlobSavedMessage(), getFormatDescription() (+52 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (37): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), isClaudeMdExcluded(), resolveExcludePatterns(), startSignalPolling() (+29 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+39 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (11): finalizeHook(), CircularBuffer, buildAuthUrl(), AbortedShellCommand, prependStderr(), ShellCommandImpl, StreamWrapper, safeJoinLines() (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (23): getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled(), findChannelEntry(), gateChannelServer(), getEffectiveChannelAllowlist(), createChannelPermissionCallbacks(), filterPermissionRelayClients() (+15 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (30): count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled(), runFilePersistence(), buildDownloadPath() (+22 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (5): createLinkedTransportPair(), InProcessTransport, WebSocketTransport, SdkControlClientTransport, SdkControlServerTransport

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (11): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (13): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (14): getApiKeyHelperSources(), getAwsCommandsSources(), getBashPermissionSources(), getDangerousEnvVarsSources(), getGcpCommandsSources(), getHooksSources(), getOtelHeadersHelperSources(), hasApiKeyHelper() (+6 more)

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 41 - "Community 41"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.27
Nodes (9): getRenderContext(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 49 - "Community 49"
Cohesion: 0.42
Nodes (7): countUnescapedChar(), hasUnescapedEmptyParens(), isEscaped(), validatePermissionRule(), getCustomValidation(), isBashPrefixTool(), isFilePatternTool()

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 51 - "Community 51"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 54 - "Community 54"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 55 - "Community 55"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 59 - "Community 59"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

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

### Community 85 - "Community 85"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 227 - "Community 227"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 48`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 227`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 31`, `Community 34`, `Community 41`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 26`, `Community 29`, `Community 36`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 39`, `Community 49`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 311 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 311 INFERRED edges - model-reasoned connections that need verification._