# Graph Report - storage-platform  (2026-05-23)

## Corpus Check
- 2405 files · ~2,274,670 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14151 nodes · 44905 edges · 52 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15293 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 198|Community 198]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 317 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `qC()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (281): getAgentModelOptions(), extractTranscript(), logContainsQuery(), AbortError, createApiQueryHook(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage() (+273 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1285): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), formatAgentId(), parseAgentId() (+1277 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (488): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), triggerTrashCron(), runWithAgentContext(), _runAndCache() (+480 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (841): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+833 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (715): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), agenticSessionSearch(), getAutoBackgroundMs() (+707 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (379): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+371 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (470): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+462 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (441): AddPermissionRules(), getDefaultSubagentModel(), consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), getOverrideSourceLabel(), resolveAgentModelDisplay() (+433 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (358): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+350 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (391): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), normalizeToolInput(), prependUserContext() (+383 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (263): checkAndRefreshOAuthTokenIfNeeded(), isGateOpen(), checkBridgePrerequisites(), call(), BridgeFatalError, createBridgeApiClient(), extractErrorTypeFromData(), handleErrorStatus() (+255 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (268): registerMcpAddCommand(), formatTime(), finalizeHook(), generateFileAttachment(), getUnifiedTaskAttachments(), resetSentSkillNames(), tryGetPDFReference(), countMemoryFileAccessFromEntries() (+260 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (322): createAbortController(), createChildAbortController(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), getSessionMessages(), applySettingsChange(), flushAsciicastRecorder(), getRecordFilePath() (+314 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (178): getValue(), withDiagnosticsTiming(), _a, aa, Ai(), as(), at(), be() (+170 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (211): isAgentMemoryPath(), checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), removeDeliveredAsyncHooks(), getAsyncHookResponseAttachments() (+203 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (182): getAgentMemoryDir(), getAgentMemoryEntrypoint(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent(), getSnapshotJsonPath() (+174 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (136): BaseTextInput(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), contentContainsImages(), inferCompactSchema() (+128 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (159): canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isTeammateAgentContext(), call(), isAgentSwarmsEnabled() (+151 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (146): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionPermissionRequest(), AskUserQuestionWithHighlight() (+138 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (90): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+82 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (129): is1PApiCustomer(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent(), formatMessagesForContext() (+121 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (136): classifyHandoffIfNeeded(), _temp(), getAutoModeExitAttachment(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules() (+128 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (81): extractSandboxViolations(), validateUrl(), handler(), ComputerUseAppListPanel(), ComputerUseTccPanel(), call(), collectRecentAssistantTexts(), copyOrWriteToFile() (+73 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (63): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages() (+55 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (65): eagerParseCliFlag(), filterExistingPaths(), getKnownPathsForRepo(), getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive() (+57 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.05
Nodes (48): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+40 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (38): createChannelPermissionCallbacks(), filterPermissionRelayClients(), hashToId(), isChannelPermissionRelayEnabled(), shortRequestId(), truncateForPreview(), setClassifierChecking(), looksLikeISO8601() (+30 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 30 - "Community 30"
Cohesion: 0.1
Nodes (34): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+26 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (9): extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), NS, sd(), Wn(), truncateEntrypointContent() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (15): getModeFromInput(), getValueFromInput(), getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions() (+7 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (22): loadAgentsFromDirectory(), collectMarkdownFiles(), getCommandNameFromFile(), isSkillFile(), loadCommandsFromDirectory(), loadOutputStylesFromDirectory(), copyTextOf(), isNavigableMessage() (+14 more)

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (18): killShellTasksForAgent(), clearCommandQueue(), dequeue(), dequeueAll(), dequeueAllMatching(), dequeuePendingNotification(), enqueue(), extractImagesFromValue() (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 43 - "Community 43"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 50 - "Community 50"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 63 - "Community 63"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 198 - "Community 198"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 41`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 39`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 27`, `Community 29`, `Community 33`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 29`, `Community 33`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 316 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 316 INFERRED edges - model-reasoned connections that need verification._