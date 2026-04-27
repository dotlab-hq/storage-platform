# Graph Report - storage-platform  (2026-04-27)

## Corpus Check
- 2490 files · ~2,314,774 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14527 nodes · 45169 edges · 68 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15231 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 239|Community 239]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 317 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 198 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `qC()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (346): getAgentModelOptions(), extractTranscript(), logContainsQuery(), AbortError, getSettingsWithAllErrors(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage() (+338 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1527): createAbortController(), getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch() (+1519 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (726): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), registerMcpAddCommand(), listAdminProviderContents(), normalizePrefix(), toFileEntry() (+718 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (425): stripHtmlComments(), stripHtmlCommentsFromTokens(), af(), ef(), ff(), Ja(), lf(), mt() (+417 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (547): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+539 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (421): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), shouldSkipVersion(), BaseTextInput(), getBidi() (+413 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (640): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+632 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (539): runWithAgentContext(), isAgentMemoryPath(), getSessionMessages(), getRecordFilePath(), getSessionRecordingPaths(), renameRecordingForSession(), clearAllAsyncHooks(), finalizePendingAsyncHooks() (+531 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (362): parseArguments(), substituteArguments(), resolveAttachments(), validateAttachmentPaths(), classifyBashCommand(), createPromptRuleContent(), getBashPromptAllowDescriptions(), getBashPromptAskDescriptions() (+354 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (352): getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel(), resolveAgentModelDisplay(), resolveAgentOverrides(), agentsHandler(), formatAgent() (+344 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (216): AddPermissionRules(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), readClientSecret(), handleSinglePluginInstall() (+208 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (202): ActivityManager, consumeInvokingRequestId(), checkForAsyncHookResponses(), removeDeliveredAsyncHooks(), getAsyncHookResponseAttachments(), AuthCodeListener, onSelect(), addBetaInteractionAttributes() (+194 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (250): createChildAbortController(), getAgentContext(), getSubagentLogName(), isSubagentContext(), _temp(), getAutoModeExitAttachment(), suppressNextSkillListing(), getAutoModeFlagCli() (+242 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (217): formatAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getSwarmSocketName(), getLeaderPaneId(), isInITerm2(), isInsideTmux(), isInsideTmuxSync() (+209 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (208): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), buildDeepLinkBanner(), mtimeOrUndefined() (+200 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (181): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getAgentThemeColor() (+173 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (149): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost() (+141 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (155): normalizeToolInput(), countPlanModeAttachmentsSinceLastExit(), getAgentListingDeltaAttachment(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments(), getPlanModeExitAttachment(), autoCompactIfNeeded() (+147 more)

### Community 18 - "Community 18"
Cohesion: 0.01
Nodes (81): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+73 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (111): AutoUpdater(), persistBlobToTextBlock(), transformResultContent(), DevBar(), shouldShowDevBar(), _temp(), _temp8(), validateBoundedIntEnvVar() (+103 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (117): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+109 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (99): getOutputTokenUsageAttachment(), clearApiKeyHelperCache(), clearAwsCredentialsCache(), clearGcpCredentialsCache(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique() (+91 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (55): finalizeHook(), CircularBuffer, buildAuthUrl(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars() (+47 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (74): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync(), setField(), unsetField() (+66 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (67): assertMinVersion(), _temp2(), eagerParseCliFlag(), DevChannelsDialog(), _temp(), filterExistingPaths(), getKnownPathsForRepo(), gracefulShutdownSync() (+59 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (18): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (60): registerBatchSkill(), getBundledSkillExtractDir(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage(), processContent() (+52 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (19): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (48): checkBridgePrerequisites(), getBridgeAccessToken(), getBridgeBaseUrl(), getBridgeBaseUrlOverride(), getBridgeTokenOverride(), checkBridgeMinVersion(), getBridgeDisabledReason(), getOauthAccountInfo() (+40 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (37): ComputerUseAppListPanel(), ComputerUseTccPanel(), escapeForDiff(), getPatchForDisplay(), getPatchFromContents(), addLineNumbers(), convertLeadingTabsToSpaces(), isCompactLinePrefixEnabled() (+29 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (34): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+26 more)

### Community 32 - "Community 32"
Cohesion: 0.07
Nodes (26): getDiagnosticAttachments(), callIdeRpc(), getCommands(), addCronTask(), getCronFilePath(), hasCronTasksSync(), markCronTasksFired(), removeCronTasks() (+18 more)

### Community 33 - "Community 33"
Cohesion: 0.07
Nodes (18): _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), POST(), handleStreamingResponse(), parseToolArguments(), createContext() (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (4): filterToolsForAgent(), getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 39 - "Community 39"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (8): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 48 - "Community 48"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 51 - "Community 51"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 54 - "Community 54"
Cohesion: 0.52
Nodes (6): forceStopPreventSleep(), killCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 55 - "Community 55"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 69 - "Community 69"
Cohesion: 0.4
Nodes (3): AntSlowLogger, callerFrame(), addSlowOperation()

### Community 73 - "Community 73"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 77 - "Community 77"
Cohesion: 0.4
Nodes (1): toOpenAiCompletion()

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 86 - "Community 86"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 87 - "Community 87"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (2): createS3Client(), readRequiredEnv()

### Community 239 - "Community 239"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 47`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (5 nodes): `toOpenAiChunk()`, `toOpenAiChunkWithUsage()`, `toOpenAiCompletion()`, `toSseEvent()`, `-openai-helpers.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (3 nodes): `createS3Client()`, `readRequiredEnv()`, `s3-compat.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 239`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 29`, `Community 31`, `Community 39`, `Community 54`, `Community 69`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 9` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 29`, `Community 32`, `Community 33`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 19`, `Community 23`, `Community 24`, `Community 33`, `Community 37`, `Community 45`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 316 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 316 INFERRED edges - model-reasoned connections that need verification._