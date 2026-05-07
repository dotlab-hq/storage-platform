# Graph Report - storage-platform  (2026-05-08)

## Corpus Check
- 2531 files · ~2,330,041 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14617 nodes · 45546 edges · 59 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15538 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 237|Community 237]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 323 edges
5. `String()` - 204 edges
6. `jsonStringify()` - 200 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts
- `setup()` --calls--> `generateTmuxSessionName()`  [INFERRED]
  claude-code-source-main\src\setup.ts → claude-code-source-main\src\utils\worktree.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (350): extractTranscript(), logContainsQuery(), getSettingsWithAllErrors(), parseArguments(), substituteArguments(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage() (+342 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (729): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+721 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (923): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), appendSystemContext(), axiosGetWithRetry(), isTransientNetworkError(), parseArgumentNames(), getLSPDiagnosticAttachments() (+915 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (449): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+441 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (724): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+716 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (376): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), BaseTextInput(), getBidi(), hasRTLCharacters(), needsBidi() (+368 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (610): createAbortController(), createChildAbortController(), ActivityManager, getOverrideSourceLabel(), resolveAgentModelDisplay(), resolveAgentOverrides(), agentsHandler(), formatAgent() (+602 more)

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (509): AgentDetail(), AgentEditor(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath() (+501 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (443): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), logAPIPrefix(), splitSysPromptPrefix(), applySettingsChange(), getUltrathinkEffortAttachment() (+435 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (326): registerMcpAddCommand(), formatTime(), finalizeHook(), generateFileAttachment(), getDynamicSkillAttachments(), resetSentSkillNames(), tryGetPDFReference(), detectMimeTypeFromPath() (+318 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (334): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+326 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (301): agenticSessionSearch(), formatAgentId(), parseAgentId(), count(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), getNpmDistTags() (+293 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (223): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession(), getCodeWebUrl() (+215 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (227): isAgentMemoryPath(), getDiagnosticAttachments(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), getOpenedFileFromIDE(), isFileReadDenied(), validateAttachmentPaths() (+219 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (273): normalizeToolInput(), prependUserContext(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments(), getPlanModeExitAttachment() (+265 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (154): getConfiguredOtelHeadersHelper(), getOtelHeadersFromHelper(), isOtelHeadersHelperFromProjectOrLocalSettings(), setMockBillingAccessOverride(), analyzeContext(), increment(), processBlock(), tokenStatsToStatsigMetrics() (+146 more)

### Community 16 - "Community 16"
Cohesion: 0.03
Nodes (79): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+71 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (141): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getAutoModeDenials(), openPath() (+133 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (114): AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent(), formatMessagesForContext() (+106 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (118): getOutputTokenUsageAttachment(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir() (+110 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (114): checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), removeDeliveredAsyncHooks(), getAsyncHookResponseAttachments(), isInstructionsMemoryType() (+106 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (112): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+104 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (116): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getUnifiedTaskAttachments() (+108 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (82): validateUrl(), useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown(), clampToViewport() (+74 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (113): clearCACertsCache(), notifyChange(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue() (+105 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (100): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+92 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (86): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost() (+78 more)

### Community 27 - "Community 27"
Cohesion: 0.03
Nodes (93): AddPermissionRules(), ComputerUseAppListPanel(), ComputerUseTccPanel(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601() (+85 more)

### Community 28 - "Community 28"
Cohesion: 0.03
Nodes (80): _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode() (+72 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (24): AbortError, BoundedUUIDSet, handleIngressMessage(), handleServerControlRequest(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys() (+16 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.07
Nodes (7): _2, createLinkedTransportPair(), InProcessTransport, WebSocketTransport, handleMessageFromStream(), SdkControlClientTransport, SdkControlServerTransport

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (27): getCommands(), computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), addCronTask(), getCronFilePath(), hasCronTasksSync() (+19 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 36 - "Community 36"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 37 - "Community 37"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 45 - "Community 45"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 46 - "Community 46"
Cohesion: 0.28
Nodes (6): formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), recollapsePastedContent()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 50 - "Community 50"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 51 - "Community 51"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 57 - "Community 57"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 64 - "Community 64"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 237 - "Community 237"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 44`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 30`, `Community 34`, `Community 37`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 27`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 15` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 27`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 322 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 322 INFERRED edges - model-reasoned connections that need verification._