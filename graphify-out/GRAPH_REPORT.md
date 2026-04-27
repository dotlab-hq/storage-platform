# Graph Report - storage-platform  (2026-04-27)

## Corpus Check
- 2491 files · ~2,314,779 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14533 nodes · 45185 edges · 62 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15239 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 232|Community 232]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 318 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 198 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts
- `incrementProjectOnboardingSeenCount()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\projectOnboardingState.ts → claude-code-source-main\src\utils\config.ts
- `getOriginalCwd()` --calls--> `stdErrAppendShellResetMessage()`  [INFERRED]
  claude-code-source-main\src\bootstrap\state.ts → claude-code-source-main\src\tools\BashTool\utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (400): createChildAbortController(), extractTranscript(), logContainsQuery(), createApiQueryHook(), uniq(), AskUserQuestionResultMessage(), collectRecentSuccessfulTools(), collectSurfacedMemories() (+392 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1102): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), parseAgentId(), getSettingsWithAllErrors(), parseArgumentNames(), filterToBundledAndMcp(), getLSPDiagnosticAttachments() (+1094 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (445): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), getWatchTargets(), initialize(), createLocalFallbackReply() (+437 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (588): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), AbortError, axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession() (+580 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (734): createAbortController(), getAgentContext(), getSubagentLogName(), isSubagentContext(), runWithAgentContext(), getSessionMessages(), countToolUses(), emitTaskProgress() (+726 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (490): AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider(), useAppState() (+482 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (697): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+689 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (326): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), Box(), handleServerControlRequest(), checkAndDisableBypassPermissionsIfNeeded(), cleanupStream() (+318 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (452): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), AnimatedClawd(), hold(), useClawdAnimation(), isDefaultAssetsBucketName() (+444 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (446): getContextFromEvent(), isApiEvent(), logActivity(), getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel(), resolveAgentModelDisplay() (+438 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (311): isAgentMemoryPath(), logContextMetrics(), getDynamicSkillAttachments(), validateAttachmentPaths(), parseFrontmatterPaths(), prefetchAllMcpResources(), isClmAllowedType(), normalizeTypeName() (+303 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (272): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionPermissionRequest(), AskUserQuestionWithHighlight() (+264 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (233): registerMcpAddCommand(), formatTime(), logAPIPrefix(), InvalidApiKeyMessage(), resetSentSkillNames(), AuthenticationCancelledError, authLogout(), ClaudeAuthProvider (+225 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (279): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+271 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (230): filterToolsForAgent(), appendSystemContext(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), queryWithModel() (+222 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (186): withActivityLogging(), ActivityManager, getValue(), withDiagnosticsTiming(), captureScreenshot(), convertBlobUrlToDataUrl(), onDragOver(), onDrop() (+178 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (109): getChangedFiles(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), isInstructionsMemoryType(), memoryFilesToAttachments(), getUserFromApiKey(), hasChatCompletionsScope() (+101 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (126): checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), removeDeliveredAsyncHooks(), getAsyncHookResponseAttachments(), refreshAwsAuth() (+118 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (119): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+111 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (112): AddPermissionRules(), getDiagnosticAttachments(), callIdeRpc(), ComputerUseAppListPanel(), looksLikeISO8601(), DiagnosticTrackingService, escapeForDiff(), getPatchForDisplay() (+104 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (109): generateFileAttachment(), tryGetPDFReference(), BaseTextInput(), callMCPTool(), contentContainsImages(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), processMCPResult() (+101 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (76): getOutputTokenUsageAttachment(), CCRClient, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled(), findChannelEntry(), gateChannelServer(), getEffectiveChannelAllowlist() (+68 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (100): formatAgentId(), getSwarmSocketName(), getLeaderPaneId(), isInsideTmux(), isInsideTmuxSync(), isTmuxAvailable(), getModifiers(), isModifierPressed() (+92 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (59): finalizeHook(), CircularBuffer, getHasFormattedOutput(), _temp8(), validateBoundedIntEnvVar(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig() (+51 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (68): _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode() (+60 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (56): assertMinVersion(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), BypassPermissionsModeDialog(), _temp(), _temp2() (+48 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (56): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages() (+48 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (15): formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), collectListeners(), Dispatcher, getEventPriority(), getHandler() (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (40): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+32 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (25): useChatShellActions(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync() (+17 more)

### Community 31 - "Community 31"
Cohesion: 0.07
Nodes (29): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles(), buildInlineReference() (+21 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (14): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (17): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (11): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 47 - "Community 47"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (2): fireRawRead(), startMdmRawRead()

### Community 54 - "Community 54"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 82 - "Community 82"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 85 - "Community 85"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 232 - "Community 232"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 46`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (7 nodes): `constants.ts`, `rawRead.ts`, `getMacOSPlistPaths()`, `execFilePromise()`, `fireRawRead()`, `getMdmRawReadPromise()`, `startMdmRawRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 232`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 31`, `Community 32`, `Community 35`, `Community 41`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 9` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 31`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 26`, `Community 27`, `Community 31`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._