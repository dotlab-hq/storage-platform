# Graph Report - storage-platform  (2026-04-30)

## Corpus Check
- 2526 files · ~2,326,160 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14617 nodes · 45451 edges · 64 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15430 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 237|Community 237]]

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
Nodes (373): getAgentModelOptions(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), saveAgentToFile() (+365 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1420): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), parseAgentId(), readJsonFile(), appendSystemContext(), axiosGetWithRetry() (+1412 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (558): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+550 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (534): AddPermissionRules(), getAgentModelDisplay(), AgentEditor(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath(), AgentNavigationFooter(), call(), AgentsMenu() (+526 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (552): getContextFromEvent(), isApiEvent(), logActivity(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability() (+544 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (370): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+362 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (527): withActivityLogging(), ActivityManager, getAgentColor(), setAgentColor(), AgentDetail(), resolveAgentOverrides(), resolveAgentTools(), analyzeContextUsage() (+519 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (533): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+525 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (543): createAbortController(), createChildAbortController(), isTeammateAgentContext(), getActualRelativeAgentFilePath(), getSessionMessages(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), getAutoBackgroundMs() (+535 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (222): registerMcpAddCommand(), formatTime(), finalizeHook(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getTranscriptStats(), isTerminalOutput() (+214 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (299): clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDiagnosticAttachments(), resetSentSkillNames(), authLogin(), authLogout(), checkAndRefreshOAuthTokenIfNeeded(), checkAndRefreshOAuthTokenIfNeededImpl() (+291 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (277): isAgentMemoryPath(), generateFileAttachment(), getDirectoriesToProcess(), getDynamicSkillAttachments(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), getOpenedFileFromIDE(), getSelectedLinesFromIDE() (+269 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (245): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession(), getCodeWebUrl() (+237 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (267): normalizeToolInput(), countAutoModeAttachmentsSinceLastExit(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getAutoModeAttachments(), getAutoModeAttachmentTurnCount(), getAutoModeExitAttachment() (+259 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (249): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+241 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (206): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath() (+198 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (117): registerPendingAsyncHook(), validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab() (+109 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (163): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getUnifiedTaskAttachments() (+155 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (134): consumeInvokingRequestId(), AutoUpdater(), BaseTextInput(), persistBlobToTextBlock(), transformResultContent(), DevBar(), shouldShowDevBar(), _temp() (+126 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (75): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, FileItem() (+67 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (118): getAgentContext(), getSubagentLogName(), isSubagentContext(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt() (+110 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (102): classifyHandoffIfNeeded(), getOutputTokenUsageAttachment(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules(), getBashPromptDenyDescriptions() (+94 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (41): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), stripHtmlComments(), stripHtmlCommentsFromTokens(), startSignalPolling() (+33 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (76): assertMinVersion(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), BypassPermissionsModeDialog(), _temp2(), eagerParseCliFlag() (+68 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (71): ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), contentContainsImages(), processMCPResult() (+63 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (61): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+53 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (50): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+42 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (43): escapeForDiff(), getPatchForDisplay(), getPatchFromContents(), _temp8(), validateBoundedIntEnvVar(), HighlightedCodeFallback(), convertLeadingTabsToSpaces(), FileWriteToolDiff() (+35 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (44): createGetAppStateWithAllowedTools(), prepareForkedCommandContext(), filterSettingsEnv(), withoutCcdSpawnEnvKeys(), withoutHostManagedProviderVars(), withoutSSHTunnelVars(), isProviderManagedEnvVar(), findDangerousClassifierPermissions() (+36 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (17): AbortError, extractInboundMessageFields(), normalizeImageBlocks(), fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage() (+9 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (5): CCRClient, HybridTransport, handleOrphanedPermissionResponse(), unregisterSessionActivityCallback(), WebSocketTransport

### Community 33 - "Community 33"
Cohesion: 0.07
Nodes (28): looksLikeISO8601(), commitTextField(), handleAbort(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField() (+20 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 35 - "Community 35"
Cohesion: 0.07
Nodes (7): _2, createLinkedTransportPair(), InProcessTransport, WebSocketTransport, handleMessageFromStream(), SdkControlClientTransport, SdkControlServerTransport

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

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
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 52 - "Community 52"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 53 - "Community 53"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 75 - "Community 75"
Cohesion: 0.5
Nodes (1): detectCodeIndexingFromMcpServerName()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 85 - "Community 85"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 87 - "Community 87"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 237 - "Community 237"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 47`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `codeIndexing.ts`, `detectCodeIndexingFromCommand()`, `detectCodeIndexingFromMcpServerName()`, `detectCodeIndexingFromMcpTool()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 27`, `Community 28`, `Community 30`, `Community 32`, `Community 34`, `Community 43`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 23`, `Community 25`, `Community 29`, `Community 39`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 322 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 322 INFERRED edges - model-reasoned connections that need verification._