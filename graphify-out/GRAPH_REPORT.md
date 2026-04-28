# Graph Report - storage-platform  (2026-04-28)

## Corpus Check
- 2517 files · ~2,323,327 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14603 nodes · 45347 edges · 62 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15336 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 235|Community 235]]

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
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (390): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), formatAgent(), getSettingsWithAllErrors(), uniq() (+382 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1227): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), parseAgentId(), readJsonFile(), countTokensWithFallback(), axiosGetWithRetry() (+1219 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (973): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, deleteProvider(), resetProviderForm(), startEditingProvider() (+965 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (515): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+507 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (424): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), BaseTextInput(), getBidi(), hasRTLCharacters(), needsBidi() (+416 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (632): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getAutoBackgroundMs(), isModelAlias() (+624 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (499): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep() (+491 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (455): runWithAgentContext(), getSessionMessages(), emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle(), flushAsciicastRecorder(), getRecordFilePath() (+447 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (318): createAbortController(), createChildAbortController(), getAgentContext(), getSubagentLogName(), isSubagentContext(), AbortError, countToolUses(), finalizeAgentTool() (+310 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (305): isAgentMemoryPath(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), getOpenedFileFromIDE(), isFileReadDenied(), detectBlockedSleepPattern(), isAutobackgroundingAllowed() (+297 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (251): registerMcpAddCommand(), canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), generateFileAttachment(), getDiagnosticAttachments() (+243 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (288): consumeInvokingRequestId(), getUltrathinkEffortAttachment(), resetSentSkillNames(), authLogin(), authLogout(), checkAndRefreshOAuthTokenIfNeededImpl(), clearOAuthTokenCache(), AuthCodeListener (+280 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (276): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession(), getCodeWebUrl() (+268 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (248): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), buildDeepLinkBanner() (+240 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (208): checkAndRefreshOAuthTokenIfNeeded(), notifyChange(), collapseBackgroundBashNotifications(), isCompletedBackgroundBash(), collapseReadSearchGroups(), commandAsHint(), countToolUses(), createCollapsedGroup() (+200 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (204): isTeammateAgentContext(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), classifyHandoffIfNeeded(), getDefaultAppState(), TaskStatusMessage(), getAutoModeExitAttachment() (+196 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (175): AddPermissionRules(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+167 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (189): normalizeToolInput(), splitSysPromptPrefix(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments() (+181 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (113): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+105 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (174): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+166 more)

### Community 20 - "Community 20"
Cohesion: 0.01
Nodes (105): validateUrl(), useChatShellActions(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), formatRelativeDate() (+97 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (81): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+73 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (60): finalizeHook(), CircularBuffer, buildAuthUrl(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars() (+52 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (70): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+62 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (44): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), isClaudeMdExcluded(), resolveExcludePatterns(), startSignalPolling() (+36 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (18): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+39 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (25): CCRClient, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled(), findChannelEntry(), gateChannelServer(), getEffectiveChannelAllowlist(), createChannelPermissionCallbacks() (+17 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (30): _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), createDeepAgentGraph(), createAgentNode(), parseToolCallChunks(), toolNode() (+22 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (26): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), handleMediaInputChange(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart() (+18 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (3): loggingPostHook(), loggingPreHook(), runPreHooks()

### Community 40 - "Community 40"
Cohesion: 0.2
Nodes (4): loadCorsConfig(), validateCorsTestCases(), getDefaultCorsConfig(), validateCorsConfig()

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 45 - "Community 45"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (5): ConfirmationAccepted(), ConfirmationActions(), ConfirmationRejected(), ConfirmationRequest(), useConfirmation()

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (2): MicSelector(), useAudioDevices()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (1): FlushGate

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (2): fireRawRead(), startMdmRawRead()

### Community 54 - "Community 54"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (1): handleCreate()

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 60 - "Community 60"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 67 - "Community 67"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 68 - "Community 68"
Cohesion: 0.6
Nodes (4): shouldLogDebugMessage(), extractDebugCategories(), shouldShowDebugCategories(), shouldShowDebugMessage()

### Community 72 - "Community 72"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (1): SentryErrorBoundary

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 88 - "Community 88"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 235 - "Community 235"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 45`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (9 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (7 nodes): `FlushGate`, `.deactivate()`, `.drop()`, `.end()`, `.enqueue()`, `.pendingCount()`, `.start()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (7 nodes): `constants.ts`, `rawRead.ts`, `getMacOSPlistPaths()`, `execFilePromise()`, `fireRawRead()`, `getMdmRawReadPromise()`, `startMdmRawRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (7 nodes): `copyLink()`, `handleCreate()`, `handleToggleOff()`, `loadCreateShareLinkFn()`, `loadGetShareLinkFn()`, `loadToggleShareLinkFn()`, `share-modal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `SentryErrorBoundary`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 235`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 28`, `Community 68`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 23`, `Community 29`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 23`, `Community 26`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 320 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 320 INFERRED edges - model-reasoned connections that need verification._