# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2464 files · ~2,307,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14448 nodes · 44987 edges · 59 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15132 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 224|Community 224]]

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
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `saveCurrentSessionCosts()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\config.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (558): getAgentModelOptions(), AbortError, countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle() (+550 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (656): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+648 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (842): getContextFromEvent(), isApiEvent(), logActivity(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry() (+834 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (799): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), isTeammateAgentContext(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), getAutoBackgroundMs(), resolveTeamName() (+791 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (833): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), parseAgentId(), applySettingsChange(), registerPendingAsyncHook(), generateFileAttachment(), getDirectoriesToProcess() (+825 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (423): resetProviderForm(), startEditingProvider(), submitProvider(), af(), ef(), ff(), Ja(), lf() (+415 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (398): call(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi() (+390 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (476): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), normalizeToolInput(), prependUserContext(), createAttachmentMessage(), getCompactionReminderAttachment() (+468 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (441): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+433 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (453): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+445 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (420): createAbortController(), createChildAbortController(), runWithAgentContext(), getActualRelativeAgentFilePath(), getSessionMessages(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths() (+412 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (180): withActivityLogging(), getValue(), runWithCwdOverride(), withDiagnosticsTiming(), main(), convertBlobUrlToDataUrl(), _a, aa (+172 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (193): formatTime(), resetSentSkillNames(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearOAuthTokenCache(), clearServerTokensFromLocalStorage(), createAuthFetch() (+185 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (213): deleteProvider(), toggleProviderAvailability(), readClientSecret(), assertMinVersion(), onSelect(), bashCommandIsSafe_DEPRECATED(), bashCommandIsSafeAsync_DEPRECATED(), extractQuotedContent() (+205 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (136): checkAndRefreshOAuthTokenIfNeeded(), CCRClient, fanOut(), notifyChange(), createChannelPermissionCallbacks(), filterPermissionRelayClients(), hashToId(), isChannelPermissionRelayEnabled() (+128 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (150): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+142 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (159): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), safeSpawn() (+151 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (140): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), Byline(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isClaudeInChromeMCPServer() (+132 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (138): classifyMcpToolForCollapse(), normalize(), clearClaudeAIMcpConfigsCache(), hasClaudeAiMcpEverConnected(), markClaudeAiMcpConnected(), areMcpConfigsEqual(), callMCPTool(), clearMcpAuthCache() (+130 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (113): getDefaultAppState(), mtimeOrUndefined(), readLastFetchTime(), eagerParseCliFlag(), attributionRestoreStateFromLog(), computeContentHash(), computeFileModificationState(), createEmptyAttributionState() (+105 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (96): registerBatchSkill(), clearBuiltinPlugins(), getBuiltinPluginDefinition(), getBuiltinPlugins(), getBuiltinPluginSkillCommands(), isBuiltinPluginId(), registerBuiltinPlugin(), skillDefinitionToCommand() (+88 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (62): validateUrl(), useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown(), clampToViewport() (+54 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (54): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+46 more)

### Community 24 - "Community 24"
Cohesion: 0.05
Nodes (61): ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), detectAvailableBrowser(), getAllSocketPaths() (+53 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (32): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments() (+24 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (56): AddPermissionRules(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField() (+48 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (13): finalizeHook(), CircularBuffer, _temp8(), validateBoundedIntEnvVar(), formatTaskOutput(), getMaxTaskOutputLength(), getMaxOutputLength(), prependStderr() (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (59): count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled(), runFilePersistence(), buildDownloadPath() (+51 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (49): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), checkAndDisableAutoModeIfNeeded() (+41 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.1
Nodes (15): getOverrideSourceLabel(), resolveAgentModelDisplay(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath() (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (11): _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), createContext(), executeEnhancedTool(), executePostHooks(), executePreHooks() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 36 - "Community 36"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 40 - "Community 40"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 44 - "Community 44"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 51 - "Community 51"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 52 - "Community 52"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 59 - "Community 59"
Cohesion: 0.6
Nodes (5): foldShutdown(), foldSpawn(), makeShutdownNotif(), makeSpawnNotif(), parseCount()

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

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

### Community 83 - "Community 83"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 224 - "Community 224"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 43`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 224`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 28`, `Community 29`, `Community 30`, `Community 34`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 27`, `Community 28`, `Community 34`, `Community 51`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._