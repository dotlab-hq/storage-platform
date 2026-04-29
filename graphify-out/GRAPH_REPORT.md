# Graph Report - storage-platform  (2026-04-30)

## Corpus Check
- 2526 files · ~2,326,184 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14618 nodes · 45456 edges · 72 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15434 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 244|Community 244]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 323 edges
5. `String()` - 203 edges
6. `jsonStringify()` - 200 edges
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
Nodes (376): getAgentModelOptions(), extractTranscript(), logContainsQuery(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), countAutoModeAttachmentsSinceLastExit(), extractAgentMentions() (+368 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1352): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), readJsonFile() (+1344 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (813): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+805 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (530): formatTime(), normalizeDirectToolCall(), persistBlobToTextBlock(), transformResultContent(), af(), ef(), ff(), Ja() (+522 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (801): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getDefaultSubagentModel(), isTeammateAgentContext() (+793 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (523): AddPermissionRules(), getAgentModelDisplay(), AgentEditor(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath(), AgentNavigationFooter(), call(), AgentsMenu() (+515 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (633): createAbortController(), createChildAbortController(), ActivityManager, normalizePrefix(), toFileEntry(), toFolderEntry(), runWithAgentContext(), getActualRelativeAgentFilePath() (+625 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (381): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+373 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (415): isAgentMemoryPath(), parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder() (+407 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (344): getAgentContext(), getSubagentLogName(), isSubagentContext(), analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens() (+336 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (216): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath() (+208 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (197): clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDiagnosticAttachments(), getOutputTokenUsageAttachment(), resetSentSkillNames(), authLogout(), AuthCodeListener, isCustomApiKeyApproved() (+189 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (189): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), registerPendingAsyncHook() (+181 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (201): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+193 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (112): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), saveAgentToFile(), updateAgentFile() (+104 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (164): parseAgentId(), getDefaultAppState(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), attributionRestoreStateFromLog(), calculateCommitAttribution(), computeContentHash() (+156 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (68): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), collectListeners() (+60 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (69): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, consumeEarlyInput() (+61 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (125): getSettingsWithAllErrors(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost() (+117 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (88): CCRClient, createChannelPermissionCallbacks(), filterPermissionRelayClients(), hashToId(), isChannelPermissionRelayEnabled(), shortRequestId(), truncateForPreview(), setClassifierChecking() (+80 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (110): assertMinVersion(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), BypassPermissionsModeDialog(), _temp2(), eagerParseCliFlag() (+102 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (88): generateFileAttachment(), tryGetPDFReference(), BaseTextInput(), contentContainsImages(), processMCPResult(), _temp8(), validateBoundedIntEnvVar(), getFileModificationTimeAsync() (+80 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (101): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+93 more)

### Community 23 - "Community 23"
Cohesion: 0.05
Nodes (72): registerMcpAddCommand(), canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), AuthenticationCancelledError, ClaudeAuthProvider (+64 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (82): consumeInvokingRequestId(), onSelect(), isAutoModeAllowlistedTool(), recordDenial(), recordSuccess(), shouldFallbackToPrompting(), getHostPlatformForAnalytics(), classifyAPIError() (+74 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (35): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), stripHtmlComments(), stripHtmlCommentsFromTokens(), startSignalPolling() (+27 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (18): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+10 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (61): is1PApiCustomer(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), setMeterState() (+53 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+39 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (24): AbortError, isTransientNetworkError(), contentToText(), ExitPlanModeScanner, extractApprovedPlan(), extractTeleportPlan(), pollForApprovedExitPlanMode(), UltraplanPollError (+16 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (23): extractMarkupText(), formatCallHierarchyItem(), formatDocumentSymbolNode(), formatDocumentSymbolResult(), formatFindReferencesResult(), formatGoToDefinitionResult(), formatHoverResult(), formatIncomingCallsResult() (+15 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (17): createDeepAgentGraph(), createAgentNode(), parseToolCallChunks(), buildSupervisorGraph(), createAgentNode(), createSupervisorNode(), supervisorNode(), getMessageType() (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (8): formatErrorMessage(), getErrorGuidance(), buildErrorRows(), buildMarketplaceAction(), buildPluginAction(), getExtraMarketplaceSourceInfo(), getPluginNameFromError(), isTransientError()

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

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
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 51 - "Community 51"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 52 - "Community 52"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 55 - "Community 55"
Cohesion: 0.39
Nodes (6): detectFromColorFgBg(), getSystemThemeName(), hexComponent(), parseOscRgb(), resolveThemeSetting(), themeFromOscColor()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 58 - "Community 58"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 59 - "Community 59"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 66 - "Community 66"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

### Community 74 - "Community 74"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 82 - "Community 82"
Cohesion: 0.5
Nodes (1): detectCodeIndexingFromMcpServerName()

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 92 - "Community 92"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 93 - "Community 93"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 244 - "Community 244"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 49`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (4 nodes): `codeIndexing.ts`, `detectCodeIndexingFromCommand()`, `detectCodeIndexingFromMcpServerName()`, `detectCodeIndexingFromMcpTool()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 244`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 33`, `Community 34`, `Community 43`, `Community 52`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 30`, `Community 32`, `Community 35`, `Community 39`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 27`, `Community 30`, `Community 34`, `Community 37`, `Community 52`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 322 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 322 INFERRED edges - model-reasoned connections that need verification._