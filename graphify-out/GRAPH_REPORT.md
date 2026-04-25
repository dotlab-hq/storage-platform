# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2454 files · ~2,304,954 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14437 nodes · 44985 edges · 55 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15124 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 220|Community 220]]

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
- `tokenStatsToStatsigMetrics()` --calls--> `round()`  [INFERRED]
  claude-code-source-main\src\utils\contextAnalysis.ts → claude-code-source-main\src\cost-tracker.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts
- `incrementProjectOnboardingSeenCount()` --calls--> `saveCurrentProjectConfig()`  [INFERRED]
  claude-code-source-main\src\projectOnboardingState.ts → claude-code-source-main\src\utils\config.ts
- `setup()` --calls--> `generateTmuxSessionName()`  [INFERRED]
  claude-code-source-main\src\setup.ts → claude-code-source-main\src\utils\worktree.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (446): extractTranscript(), logContainsQuery(), AbortError, createApiQueryHook(), _temp(), parseArguments(), substituteArguments(), uniq() (+438 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1223): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), AddPermissionRules(), isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet() (+1215 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (603): AgentDetail(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), resolveAgentTools(), AnimatedAsterisk(), ApiKeyStep() (+595 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (674): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), formatTime(), AnimatedClawd(), hold(), useClawdAnimation() (+666 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (429): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+421 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (703): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+695 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (397): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+389 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (505): optionForPermissionSaveDestination(), deleteProvider(), isNotFoundPayload(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), getSettingsWithAllErrors() (+497 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (522): createAbortController(), createChildAbortController(), runWithAgentContext(), getOverrideSourceLabel(), resolveAgentModelDisplay(), resolveAgentOverrides(), getLocalAgentMemoryDir(), agentsHandler() (+514 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (420): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+412 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (396): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), consumeInvokingRequestId(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+388 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (260): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), prependUserContext(), finalizeHook() (+252 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (149): checkAndRefreshOAuthTokenIfNeeded(), accumulateStreamEvents(), CCRClient, clearStreamAccumulatorForMessage(), scopeKey(), notifyChange(), CircularBuffer, mcpToolInputToAutoClassifierInput() (+141 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (171): getAgentContext(), getSubagentLogName(), isSubagentContext(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath() (+163 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (167): ActivityManager, getAgentColor(), setAgentColor(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes() (+159 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (169): normalizeToolInput(), count(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments() (+161 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (92): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+84 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (119): getDiagnosticAttachments(), getDynamicSkillAttachments(), resetSentSkillNames(), authLogout(), isCustomApiKeyApproved(), isValidApiKey(), maybeRemoveApiKeyFromMacOSKeychain(), removeApiKey() (+111 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (103): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), toFileEntry(), toFolderEntry(), useChatPageData(), useFlatMessages() (+95 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (119): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent() (+111 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (89): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), parseFrontmatterPaths(), color() (+81 more)

### Community 21 - "Community 21"
Cohesion: 0.04
Nodes (48): Cursor, isVimPunctuation(), isVimWordChar(), MeasuredText, WrappedLine, getWordSegmenter(), lastGrapheme(), applySingleMotion() (+40 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (107): contentContainsImages(), inferCompactSchema(), persistBlobToTextBlock(), processMCPResult(), transformMCPResult(), transformResultContent(), callInner(), createImageResponse() (+99 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (73): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), eagerParseCliFlag(), consumeEarlyInput(), processChunk(), startCapturingEarlyInput() (+65 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (66): ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), detectAvailableBrowser(), getAllSocketPaths(), getSecureSocketPath() (+58 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (73): classifyHandoffIfNeeded(), clearAwsCredentialsCache(), clearGcpCredentialsCache(), isEnterpriseSubscriber(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique() (+65 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (32): call(), _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), createDeepAgentGraph(), createAgentNode(), parseToolCallChunks() (+24 more)

### Community 29 - "Community 29"
Cohesion: 0.09
Nodes (22): extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), NS, sd(), Wn(), collectDirectoryNames() (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (50): countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getAttributionTexts(), getEnhancedPRAttribution(), getPRAttributionData(), getTranscriptStats(), isTerminalOutput() (+42 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (28): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync(), setField(), unsetField() (+20 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (20): resolveUserId(), handleMediaInputChange(), mapBreadcrumbs(), mapItems(), handleUpload(), updateUpload(), useUploadStore(), completeMultipartUpload() (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (11): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter(), useGauge() (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 37 - "Community 37"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (4): NavProjects(), handleKeyDown(), SidebarMenuButton(), useSidebar()

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
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 46 - "Community 46"
Cohesion: 0.46
Nodes (7): forceStopPreventSleep(), killCaffeinate(), spawnCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 48 - "Community 48"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 54 - "Community 54"
Cohesion: 0.6
Nodes (5): foldShutdown(), foldSpawn(), makeShutdownNotif(), makeSpawnNotif(), parseCount()

### Community 64 - "Community 64"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 220 - "Community 220"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 44`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 220`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 29`, `Community 30`, `Community 37`, `Community 46`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 27`, `Community 28`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 28`, `Community 31`, `Community 32`, `Community 46`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 310 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 310 INFERRED edges - model-reasoned connections that need verification._