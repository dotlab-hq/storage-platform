# Graph Report - storage-platform  (2026-04-27)

## Corpus Check
- 2477 files · ~2,312,797 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14497 nodes · 45107 edges · 57 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15188 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 225|Community 225]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 315 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 198 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (434): extractTranscript(), logContainsQuery(), splitSysPromptPrefix(), createApiQueryHook(), uniq(), AskUserQuestionWithHighlight(), InvalidApiKeyMessage(), AsyncAgentDetailDialog() (+426 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (992): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), getSettingsWithAllErrors(), appendSystemContext(), logStripOnce(), applySettingsChange(), getRecordFilePath() (+984 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (546): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+538 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (826): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+818 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (725): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+717 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (383): call(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi() (+375 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (502): getSessionMessages(), normalizeToolInput(), flushAsciicastRecorder(), getSessionRecordingPaths(), renameRecordingForSession(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment() (+494 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (436): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+428 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (327): AddPermissionRules(), getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep() (+319 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (345): createAbortController(), createChildAbortController(), isTeammateAgentContext(), runWithAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet() (+337 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (251): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+243 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (333): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getDynamicSkillAttachments(), isInstructionsMemoryType() (+325 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (239): getAdvisorUsage(), consumeInvokingRequestId(), getDateChangeAttachments(), getMaxBudgetUsdAttachment(), getOutputTokenUsageAttachment(), assertMinVersion(), BypassPermissionsModeDialog(), _temp() (+231 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (276): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel(), modelSupportsAdvisor() (+268 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (246): preconnectAnthropicApi(), checkGlobalInstallPermissions(), getInstallationPrefix(), installGlobalPackage(), removeClaudeAliasesFromShellConfigs(), shouldSkipVersion(), createBedrockClient(), createBedrockRuntimeClient() (+238 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (246): getAgentContext(), getSubagentLogName(), isSubagentContext(), classifyHandoffIfNeeded(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool() (+238 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (145): registerMcpAddCommand(), formatTime(), logAPIPrefix(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch() (+137 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (110): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), createLocalFallbackReply(), generateAssistantReply(), useChatShellActions() (+102 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (178): getAutoBackgroundMs(), _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken() (+170 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (96): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+88 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (84): getUnifiedTaskAttachments(), abbreviateActivity(), buildBridgeConnectUrl(), buildBridgeSessionUrl(), timestamp(), clearPendingHint(), extractClaudeCodeHints(), firstCommandToken() (+76 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (90): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+82 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (92): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), clearClaudeAIMcpConfigsCache(), hasClaudeAiMcpEverConnected(), markClaudeAiMcpConnected(), cleanupComputerUseAfterTurn() (+84 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (38): finalizeHook(), Byline(), CircularBuffer, getTaskOutput(), _temp8(), shouldMaintainProjectWorkingDir(), validateBoundedIntEnvVar(), OrderedListComponent() (+30 more)

### Community 24 - "Community 24"
Cohesion: 0.02
Nodes (59): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+51 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (107): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+99 more)

### Community 26 - "Community 26"
Cohesion: 0.02
Nodes (72): commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField(), updateValidationError(), validateMultiSelect() (+64 more)

### Community 27 - "Community 27"
Cohesion: 0.03
Nodes (93): generateFileAttachment(), tryGetPDFReference(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), getFileModificationTimeAsync(), callInner(), createImageResponse() (+85 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (18): _t(), ce, ct(), de, _e(), Ee(), fe(), ge() (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (21): AbortError, BoundedUUIDSet, handleIngressMessage(), handleServerControlRequest(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys() (+13 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (11): _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), createContext(), executeEnhancedTool(), executePostHooks(), executePreHooks() (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 46 - "Community 46"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 60 - "Community 60"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 61 - "Community 61"
Cohesion: 0.6
Nodes (4): shouldLogDebugMessage(), extractDebugCategories(), shouldShowDebugCategories(), shouldShowDebugMessage()

### Community 65 - "Community 65"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 225 - "Community 225"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 41`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 225`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 30`, `Community 31`, `Community 61`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 29`, `Community 32`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 32`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 314 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 314 INFERRED edges - model-reasoned connections that need verification._