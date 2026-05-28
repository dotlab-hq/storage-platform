# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2409 files · ~2,278,656 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14174 nodes · 44955 edges · 53 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15310 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 196|Community 196]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 318 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 193 edges
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
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (475): getAgentModelOptions(), createApiQueryHook(), uniq(), getTerminalSize(), InvalidApiKeyMessage(), countAutoModeAttachmentsSinceLastExit(), extractAgentMentions(), extractAtMentionedFiles() (+467 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1116): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), getAutoBackgroundMs(), classifyHandoffIfNeeded(), countTokensWithFallback(), axiosGetWithRetry() (+1108 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (608): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+600 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (656): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), registerMcpAddCommand(), deleteProvider(), resetProviderForm(), startEditingProvider() (+648 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (654): ActivityManager, getAgentColor(), setAgentColor(), getAgentContext(), getSubagentLogName(), isSubagentContext(), AgentDetail(), getOverrideSourceLabel() (+646 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (388): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), shouldSkipVersion(), BaseTextInput(), getBidi() (+380 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (439): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider(), useAppState() (+431 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (500): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getDefaultSubagentModel(), consumeInvokingRequestId() (+492 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (450): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), getSettingsWithAllErrors(), appendSystemContext(), AskUserQuestionResultMessage(), readClientSecret(), installSelectedPlugins() (+442 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (392): _temp(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+384 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (267): isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), getDefaultAppState(), TaskStatusMessage() (+259 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (180): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), AuthCodeListener, CCRClient, createChannelPermissionCallbacks(), filterPermissionRelayClients() (+172 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (256): isAgentMemoryPath(), ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), decodeFont(), encodePng() (+248 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (227): applySettingsChange(), isInstructionsMemoryType(), memoryFilesToAttachments(), getLatestVersion(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify() (+219 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (224): createAbortController(), createChildAbortController(), runWithAgentContext(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+216 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (211): prependUserContext(), extractSandboxViolations(), queryHaiku(), queryModelWithoutStreaming(), queryWithModel(), createCombinedAbortSignal(), getCommandName(), findCommand() (+203 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (191): call(), normalizeToolInput(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getCompactionReminderAttachment(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment() (+183 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (101): checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizeHook(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), removeDeliveredAsyncHooks(), getAsyncHookResponseAttachments() (+93 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (135): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath() (+127 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (108): getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), getVerifyPlanReminderAttachment(), getVerifyPlanReminderTurnCount(), extractIncludePathsFromTokens(), getAllMemoryFilePaths(), getClaudeMds() (+100 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (71): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+63 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (121): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), openPath() (+113 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (94): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+86 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (90): _temp2(), eagerParseCliFlag(), DevChannelsDialog(), _temp(), consumeEarlyInput(), processChunk(), startCapturingEarlyInput(), stopCapturingEarlyInput() (+82 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (97): generateFileAttachment(), tryGetPDFReference(), getFileModificationTimeAsync(), isFileWithinReadSizeLimit(), callInner(), createImageResponse(), detectSessionFileType(), readImageWithTokenBudget() (+89 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 26 - "Community 26"
Cohesion: 0.05
Nodes (54): AddPermissionRules(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField() (+46 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (28): extractTranscript(), logContainsQuery(), AbortError, BoundedUUIDSet, extractTitleText(), handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse() (+20 more)

### Community 28 - "Community 28"
Cohesion: 0.06
Nodes (53): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), buildBridgeConnectUrl() (+45 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (44): parseArgumentNames(), parseArguments(), substituteArguments(), ApplyEffortAndClose(), call(), convertEffortValueToLevel(), executeEffort(), getDisplayedEffortLevel() (+36 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (18): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), addCronTask(), getCronFilePath(), hasCronTasksSync(), jitteredNextCronRunMs() (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (12): clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync(), getActiveConfig() (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.26
Nodes (12): getRecentReleaseNotesSync(), call(), formatReleaseNotes(), checkForReleaseNotes(), checkForReleaseNotesSync(), fetchAndStoreChangelog(), getAllReleaseNotes(), getChangelogCachePath() (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (4): filterToolsForAgent(), getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (4): NavProjects(), handleKeyDown(), SidebarMenuButton(), useSidebar()

### Community 39 - "Community 39"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 40 - "Community 40"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 41 - "Community 41"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 48 - "Community 48"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (1): handleSubmit()

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 42`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `cn()`, `handleSubmit()`, `inline-rename.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 31`, `Community 40`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 35`, `Community 40`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._