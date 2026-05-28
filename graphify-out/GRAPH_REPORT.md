# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2434 files · ~2,282,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14229 nodes · 45035 edges · 49 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15349 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 203|Community 203]]

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
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (504): extractTranscript(), logContainsQuery(), isAgentMemoryPath(), AgentNavigationFooter(), getSettingsWithAllErrors(), countSlashCommandTokens(), findSkillTool(), uniq() (+496 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (875): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), countSkillTokens(), countTokensWithFallback(), countToolDefinitionTokens(), appendSystemContext() (+867 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (447): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+439 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (650): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+642 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (662): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+654 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (383): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+375 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (433): isTeammateAgentContext(), AgentEditor(), AgentsMenu(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), filterToolsForAgent(), AnimatedAsterisk() (+425 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (498): ActivityManager, getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel(), resolveAgentModelDisplay(), resolveAgentOverrides(), agentsHandler() (+490 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (473): createAbortController(), createChildAbortController(), getSessionMessages(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+465 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (378): consumeInvokingRequestId(), logAPIPrefix(), splitSysPromptPrefix(), parseArgumentNames(), parseArguments(), substituteArguments(), getUltrathinkEffortAttachment(), classifyBashCommand() (+370 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (314): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+306 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (303): call(), getAttributionTexts(), removeClaudeAliasesFromShellConfigs(), shouldSkipVersion(), ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log() (+295 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (290): formatAgentId(), parseAgentId(), getDefaultAppState(), getTaskReminderAttachments(), getTeamContextAttachment(), getNpmDistTags(), getVersionHistory(), isInBundledMode() (+282 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (262): getDynamicSkillAttachments(), getLatestVersion(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), isClaudeMdExcluded(), resolveExcludePatterns() (+254 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (233): normalizeToolInput(), clearAllAsyncHooks(), finalizeHook(), finalizePendingAsyncHooks(), getPendingAsyncHooks(), registerPendingAsyncHook(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage() (+225 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (139): withDiagnosticsTiming(), withStatsCacheLock(), _a, aa, Ai(), as(), at(), be() (+131 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (225): getAgentContext(), getSubagentLogName(), isSubagentContext(), prependUserContext(), suppressNextSkillListing(), buildAwaySummaryPrompt(), generateAwaySummary(), extractSandboxViolations() (+217 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (183): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), ClickableImageRef() (+175 more)

### Community 18 - "Community 18"
Cohesion: 0.01
Nodes (94): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+86 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (119): AbortError, BaseTextInput(), contentContainsImages(), processMCPResult(), createImageResponse(), readImageWithTokenBudget(), asImageFilePath(), getClipboardCommands() (+111 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (75): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+67 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (133): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), getChannelAllowlist() (+125 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (112): AddPermissionRules(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField() (+104 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (64): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), decodeFont(), encodePng(), fillBackground() (+56 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (112): isClmAllowedType(), normalizeTypeName(), aliasesOf(), checkPermissionMode(), isAcceptEditsAllowedCmdlet(), isFilesystemCommand(), isItemTypeParamAbbrev(), isSymlinkCreatingCommand() (+104 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (89): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+81 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (108): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+100 more)

### Community 27 - "Community 27"
Cohesion: 0.03
Nodes (37): validateUrl(), handler(), collectListeners(), Dispatcher, getEventPriority(), getHandler(), processDispatchQueue(), EventEmitter (+29 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (58): is1PApiCustomer(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), bootstrapTelemetry() (+50 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (47): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), checkComputerUseLock() (+39 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.39
Nodes (1): oc

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (5): useS3ViewerDelete(), useS3ViewerFolder(), useS3ViewerQuery(), useS3ViewerUpload(), useS3BucketViewer()

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (2): fireRawRead(), startMdmRawRead()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 46 - "Community 46"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 203 - "Community 203"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 34`** (16 nodes): `oc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (7 nodes): `constants.ts`, `rawRead.ts`, `getMacOSPlistPaths()`, `execFilePromise()`, `fireRawRead()`, `getMdmRawReadPromise()`, `startMdmRawRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 203`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 29`, `Community 30`, `Community 32`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `logError()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 27`, `Community 32`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._