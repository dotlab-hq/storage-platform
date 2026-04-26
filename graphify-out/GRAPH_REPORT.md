# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2465 files · ~2,308,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14450 nodes · 44990 edges · 67 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15134 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 237|Community 237]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 311 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 196 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
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
Nodes (359): getAgentModelOptions(), extractTranscript(), logContainsQuery(), AbortError, uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), collectSurfacedMemories() (+351 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1137): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), appendSystemContext(), axiosGetWithRetry(), isTransientNetworkError(), applySettingsChange(), getLSPDiagnosticAttachments() (+1129 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (676): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), handleMouseEvent() (+668 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (438): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+430 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (742): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+734 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (697): getContextFromEvent(), isApiEvent(), logActivity(), registerMcpAddCommand(), getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel() (+689 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (571): createAbortController(), createChildAbortController(), runWithAgentContext(), getSessionMessages(), emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle() (+563 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (401): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), consumeInvokingRequestId(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+393 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (278): getChangedFiles(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), getFirstWordPrefix(), detectBlockedSleepPattern(), isAutobackgroundingAllowed(), isSearchOrReadBashCommand() (+270 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (256): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+248 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (282): countToolUses(), finalizeAgentTool(), normalizeToolInput(), prependUserContext(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getDeferredToolsDeltaAttachment() (+274 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (176): withActivityLogging(), ActivityManager, withDiagnosticsTiming(), convertBlobUrlToDataUrl(), getActiveTimeCounter(), _a, aa, Ai() (+168 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (196): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+188 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (246): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), addCleanupResults(), cleanupNpmCacheForAnthropicPackages(), cleanupOldDebugLogs() (+238 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (170): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getAutoModeDenials(), buildDeepLinkBanner() (+162 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (162): getSettingsWithAllErrors(), _temp(), getDefaultAppState(), getAutoModeExitAttachment(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getAttributionTexts() (+154 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (146): App, processKeysInBatch(), resumeHandler(), shouldSkipVersion(), createChannelPermissionCallbacks(), filterPermissionRelayClients(), hashToId(), isChannelPermissionRelayEnabled() (+138 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (167): classifyHandoffIfNeeded(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+159 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (159): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), getAttachments(), getQueuedCommandAttachments(), maybe(), calculateApiKeyHelperTTL() (+151 more)

### Community 19 - "Community 19"
Cohesion: 0.01
Nodes (76): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+68 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (75): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+67 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (86): count(), Byline(), CCRClient, getMemoryPath(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), countWorktreeChanges(), countModelVisibleMessagesSince() (+78 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (112): AddPermissionRules(), ComputerUseAppListPanel(), call(), formatContextAsMarkdownTable(), checkAutoCompactDisabled(), checkLargeToolResults(), checkMemoryBloat(), checkNearCapacity() (+104 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (124): agenticSessionSearch(), ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground() (+116 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (95): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+87 more)

### Community 25 - "Community 25"
Cohesion: 0.02
Nodes (63): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), _call(), enhanceTool(), enhanceToolIfNeeded() (+55 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (88): getAgentContext(), getSubagentLogName(), isSubagentContext(), suppressNextSkillListing(), AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes() (+80 more)

### Community 27 - "Community 27"
Cohesion: 0.02
Nodes (52): isTeammateAgentContext(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), finalizeHook(), TaskStatusMessage(), CircularBuffer, getClaudeCodeGuideBasePrompt() (+44 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (109): bashToolCheckCommandOperatorPermissions(), buildSegmentWithoutRedirections(), checkCommandOperatorPermissions(), segmentedCommandPermissionResult(), advance(), byteAt(), byteLengthUtf8(), checkBudget() (+101 more)

### Community 29 - "Community 29"
Cohesion: 0.03
Nodes (100): generateFileAttachment(), tryGetPDFReference(), contentContainsImages(), inferCompactSchema(), processMCPResult(), transformMCPResult(), getFileModificationTimeAsync(), isFileWithinReadSizeLimit() (+92 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+39 more)

### Community 32 - "Community 32"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 33 - "Community 33"
Cohesion: 0.07
Nodes (18): parseArgumentNames(), parseArguments(), substituteArguments(), getModeFromInput(), getValueFromInput(), getShellType(), findLastStringToken(), getBashCompletionCommand() (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (2): getAgentThemeColor(), _temp8()

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 40 - "Community 40"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (3): getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

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
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 50 - "Community 50"
Cohesion: 0.28
Nodes (6): formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), recollapsePastedContent()

### Community 51 - "Community 51"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 53 - "Community 53"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (2): getPythonApiInstructions(), renderApiInstructions()

### Community 56 - "Community 56"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 57 - "Community 57"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 71 - "Community 71"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 72 - "Community 72"
Cohesion: 0.5
Nodes (3): getTaskAssignmentSummary(), tryRenderTaskAssignmentMessage(), isTaskAssignment()

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

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 237 - "Community 237"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 32`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (14 nodes): `AgentPill()`, `getAgentThemeColor()`, `SummaryPill()`, `_temp()`, `_temp0()`, `_temp1()`, `_temp2()`, `_temp4()`, `_temp5()`, `_temp6()`, `_temp7()`, `_temp8()`, `_temp9()`, `BackgroundTaskStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (7 nodes): `It2SetupPrompt.tsx`, `getPythonApiInstructions()`, `renderApiInstructions()`, `renderFailed()`, `renderSuccess()`, `renderVerifying()`, `_temp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
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
- **Thin community `Community 97`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 31`, `Community 33`, `Community 34`, `Community 49`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 34`, `Community 39`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 30`, `Community 49`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._