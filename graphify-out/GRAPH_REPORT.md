# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2475 files · ~2,312,273 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14486 nodes · 45078 edges · 66 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15173 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 233|Community 233]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 314 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 197 edges
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
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (435): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), formatAgent(), AbortError, getSettingsWithAllErrors() (+427 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (707): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+699 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1203): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), getAgentMemoryDir() (+1195 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (576): formatTime(), getTerminalSize(), installAsciicastRecorder(), normalizeDirectToolCall(), formatTimeLabel(), af(), ef(), ff() (+568 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (905): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+897 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (596): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+588 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (321): call(), handleMouseEvent(), processKeysInBatch(), Box(), handleServerControlRequest(), checkAndDisableAutoModeIfNeeded(), checkAndDisableBypassPermissionsIfNeeded(), getClearTerminalSequence() (+313 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (456): createAbortController(), createChildAbortController(), runWithAgentContext(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), getSessionMessages(), countToolUses(), emitTaskProgress() (+448 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (390): isTeammateAgentContext(), isAgentMemoryPath(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), countMemoryFileTokens(), TaskStatusMessage(), getAttachments() (+382 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (350): getAutoBackgroundMs(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), getCompactionReminderAttachment() (+342 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (395): getAgentContext(), getSubagentLogName(), isSubagentContext(), normalizeToolInput(), prependUserContext(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment() (+387 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (287): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+279 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (251): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), consumeInvokingRequestId(), readClientSecret(), assertMinVersion() (+243 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (172): formatAgentId(), parseAgentId(), getDefaultAppState(), getTeamContextAttachment(), createEmptyAttributionState(), getClientSurface(), getSwarmSocketName(), getLeaderPaneId() (+164 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (119): App, resumeHandler(), AuthCodeListener, refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, createChannelPermissionCallbacks() (+111 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (124): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+116 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (85): validateUrl(), useChatShellActions(), ClickEvent, handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse() (+77 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (117): AutoUpdater(), callMCPTool(), contentContainsImages(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), processMCPResult(), detectCodeIndexingFromMcpServerName(), DevBar() (+109 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (80): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+72 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (121): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), getExternalClaudeMdIncludes(), hasExternalClaudeMdIncludes(), pathInOriginalCwd(), shouldShowClaudeMdExternalIncludesWarning() (+113 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (58): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, consumeEarlyInput() (+50 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (112): AddPermissionRules(), getOverrideSourceLabel(), getSourceDisplayName(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation() (+104 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (75): registerMcpAddCommand(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata(), getMcpClientConfig() (+67 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (82): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage() (+74 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (43): getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint() (+35 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (70): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), getGitDir(), getGitState(), getHead(), getIsClean() (+62 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (50): applyBedrockRegionPrefix(), createBedrockClient(), createBedrockRuntimeClient(), extractModelIdFromArn(), findFirstMatch(), getBedrockRegionPrefix(), isFoundationModel(), getAWSRegion() (+42 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (27): flushAsciicastRecorder(), finalizeHook(), CircularBuffer, buildAuthUrl(), flushDebugLogs(), _flushLogWritersForTesting(), readFileRange(), flushAndCleanup() (+19 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (44): parseArgumentNames(), parseArguments(), substituteArguments(), ApplyEffortAndClose(), call(), convertEffortValueToLevel(), executeEffort(), getDisplayedEffortLevel() (+36 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (14): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (14): getApiKeyHelperSources(), getAwsCommandsSources(), getBashPermissionSources(), getDangerousEnvVarsSources(), getGcpCommandsSources(), getHooksSources(), getOtelHeadersHelperSources(), hasApiKeyHelper() (+6 more)

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (1): oc

### Community 36 - "Community 36"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (2): getAgentThemeColor(), _temp8()

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

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
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 48 - "Community 48"
Cohesion: 0.36
Nodes (5): getShutdownMessageSummary(), tryRenderShutdownMessage(), isShutdownApproved(), isShutdownRejected(), isShutdownRequest()

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (1): FlushGate

### Community 54 - "Community 54"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 55 - "Community 55"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 56 - "Community 56"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 63 - "Community 63"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (3): getTaskAssignmentSummary(), tryRenderTaskAssignmentMessage(), isTaskAssignment()

### Community 72 - "Community 72"
Cohesion: 0.6
Nodes (4): shouldLogDebugMessage(), extractDebugCategories(), shouldShowDebugCategories(), shouldShowDebugMessage()

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

### Community 89 - "Community 89"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 233 - "Community 233"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 35`** (16 nodes): `oc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (14 nodes): `AgentPill()`, `getAgentThemeColor()`, `SummaryPill()`, `_temp()`, `_temp0()`, `_temp1()`, `_temp2()`, `_temp4()`, `_temp5()`, `_temp6()`, `_temp7()`, `_temp8()`, `_temp9()`, `BackgroundTaskStatus.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (7 nodes): `FlushGate`, `.deactivate()`, `.drop()`, `.end()`, `.enqueue()`, `.pendingCount()`, `.start()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 233`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 19`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 29`, `Community 30`, `Community 32`, `Community 45`, `Community 72`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 3` to `Community 4`, `Community 6`, `Community 7`, `Community 15`, `Community 16`, `Community 18`, `Community 24`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 313 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 313 INFERRED edges - model-reasoned connections that need verification._