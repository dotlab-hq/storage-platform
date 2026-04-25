# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2454 files · ~2,302,946 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14430 nodes · 44973 edges · 51 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15120 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 218|Community 218]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 311 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
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
- `incrementProjectOnboardingSeenCount()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\projectOnboardingState.ts → claude-code-source-main\src\utils\config.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (310): extractTranscript(), logContainsQuery(), AbortError, getSettingsWithAllErrors(), createApiQueryHook(), uniq(), InvalidApiKeyMessage(), countAutoModeAttachmentsSinceLastExit() (+302 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1135): formatAgentId(), parseAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress() (+1127 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (566): getAgentModelDisplay(), getAgentModelOptions(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk() (+558 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (483): extractIncludePathsFromTokens(), parseFrontmatterPaths(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), af(), ef(), ff() (+475 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (765): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry() (+757 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (931): ActivityManager, registerMcpAddCommand(), optionForPermissionSaveDestination(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels() (+923 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (397): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+389 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (575): getAddDirExtraMarketplaces(), isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+567 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (478): createAbortController(), createChildAbortController(), isTeammateAgentContext(), runWithAgentContext(), getActualRelativeAgentFilePath(), getSessionMessages(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet() (+470 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (420): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), formatTime(), axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession() (+412 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (393): getAddDirEnabledPlugins(), AddPermissionRules(), appendSystemContext(), AppStateProvider(), AskUserQuestionResultMessage(), readClientSecret(), installSelectedPlugins(), loadMarketplaceData() (+385 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (187): checkAndRefreshOAuthTokenIfNeeded(), BigQueryMetricsExporter, CCRClient, fanOut(), getWatchTargets(), initialize(), notifyChange(), startMdmPoll() (+179 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (201): getSessionRecordingPaths(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getTranscriptStats(), isTerminalOutput(), getUserFromApiKey(), hasChatCompletionsScope() (+193 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (146): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), getAgentPendingMessageAttachments() (+138 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (152): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath() (+144 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (204): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+196 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (153): getAgentContext(), getSubagentLogName(), isSubagentContext(), prependUserContext(), suppressNextSkillListing(), Byline(), getCommandName(), findCommand() (+145 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (88): deleteProvider(), isNotFoundPayload(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), getOutputTokenUsageAttachment(), AuthCodeListener (+80 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (53): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, lastGrapheme() (+45 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (133): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+125 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (83): validateUrl(), useChatShellActions(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown(), clampToViewport() (+75 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (91): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+83 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (80): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+72 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (65): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), contentContainsImages(), processMCPResult(), getTerminalBundleId() (+57 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (76): classifyHandoffIfNeeded(), clearApiKeyHelperCache(), clearAwsCredentialsCache(), clearGcpCredentialsCache(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique() (+68 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (73): applySettingsChange(), _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken() (+65 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (38): getDiagnosticAttachments(), callIdeRpc(), DiagnosticTrackingService, escapeForDiff(), getPatchForDisplay(), getPatchFromContents(), HighlightedCodeFallback(), convertLeadingTabsToSpaces() (+30 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (28): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync(), setField(), unsetField() (+20 more)

### Community 29 - "Community 29"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 42 - "Community 42"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 49 - "Community 49"
Cohesion: 0.6
Nodes (5): foldShutdown(), foldSpawn(), makeShutdownNotif(), makeSpawnNotif(), parseCount()

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 72 - "Community 72"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 218 - "Community 218"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 218`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 24`, `Community 26`, `Community 28`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 3` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 9`, `Community 13`, `Community 20`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._