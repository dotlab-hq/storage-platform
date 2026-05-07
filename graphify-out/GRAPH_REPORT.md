# Graph Report - storage-platform  (2026-05-07)

## Corpus Check
- 2531 files · ~2,329,978 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14616 nodes · 45545 edges · 57 communities detected
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 229|Community 229]]

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
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `deserializeLogEntry()` --calls--> `jsonParse()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\slowOperations.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (586): extractTranscript(), logContainsQuery(), AbortError, getSessionMessages(), getSettingsWithAllErrors(), createApiQueryHook(), _temp(), uniq() (+578 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (638): getAgentColor(), setAgentColor(), AgentDetail(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), resolveAgentTools() (+630 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1182): createAbortController(), createChildAbortController(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), classifyHandoffIfNeeded(), axiosGetWithRetry() (+1174 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (597): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+589 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (846): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+838 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (629): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), generateFileAttachment(), tryGetPDFReference(), validateAttachmentPaths(), getCredentialFromFd(), maybePersistTokenForSubprocesses() (+621 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (626): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+618 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (521): isAgentMemoryPath(), logContextMetrics(), parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution() (+513 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (311): call(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters() (+303 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (236): registerMcpAddCommand(), formatTime(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata() (+228 more)

### Community 10 - "Community 10"
Cohesion: 0.02
Nodes (230): formatAgentId(), parseAgentId(), getTeamContextAttachment(), getTeammateMailboxAttachments(), getSwarmSocketName(), isInITerm2(), isInsideTmux(), isInsideTmuxSync() (+222 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (164): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+156 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (190): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+182 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (159): AppStateProvider(), checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), getAsyncHookResponseAttachments(), isInstructionsMemoryType() (+151 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (193): prependUserContext(), count(), Byline(), accumulateUsage(), updateUsage(), getCommandName(), formatDescriptionWithSource(), getCommand() (+185 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (140): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), getAgentPendingMessageAttachments() (+132 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (104): AuthCodeListener, BypassPermissionsModeDialog(), _temp(), _temp2(), CCRClient, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled() (+96 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (153): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath(), addCleanupResults() (+145 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (79): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getModifiers() (+71 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (118): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+110 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (99): ActivityManager, applySedEdit(), useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery() (+91 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (89): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+81 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (64): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+56 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (48): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), collectListeners() (+40 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (59): AddPermissionRules(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync() (+51 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (58): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), AutoUpdater(), onSelect(), DevBar(), shouldShowDevBar() (+50 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (57): getRateLimitTier(), getSubscriptionType(), hasOpusAccess(), hasClaudeAiBillingAccess(), setMockBillingAccessOverride(), cacheExtraUsageDisabledReason(), checkQuotaStatus(), computeNewLimitsFromHeaders() (+49 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (49): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+41 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (48): parseEsc(), addLineNumber(), addMarker(), ansi256FromRgb(), ansiIdx(), applyBackground(), asTerminalEscaped(), buildTheme() (+40 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (24): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), createCronScheduler(), addCronTask(), getCronFilePath(), hasCronTasksSync() (+16 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (23): execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), getTLSFetchOptions(), getWebSocketTLSOptions(), configureGlobalAgents() (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (17): createDeepAgentGraph(), createAgentNode(), parseToolCallChunks(), buildSupervisorGraph(), createAgentNode(), createSupervisorNode(), supervisorNode(), getMessageType() (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (18): ApplyEffortAndClose(), call(), convertEffortValueToLevel(), executeEffort(), getDisplayedEffortLevel(), getEffortEnvOverride(), getEffortLevelDescription(), getEffortSuffix() (+10 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

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
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 49 - "Community 49"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 55 - "Community 55"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

### Community 63 - "Community 63"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 229 - "Community 229"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 43`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 229`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 28`, `Community 33`, `Community 44`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 27`, `Community 31`, `Community 44`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 26`, `Community 27`, `Community 29`, `Community 31`, `Community 34`, `Community 35`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 322 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 322 INFERRED edges - model-reasoned connections that need verification._