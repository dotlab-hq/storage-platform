# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2409 files · ~2,278,391 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14172 nodes · 44948 edges · 53 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15307 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 194|Community 194]]

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
Nodes (430): extractTranscript(), logContainsQuery(), AbortError, logAPIPrefix(), splitSysPromptPrefix(), createApiQueryHook(), uniq(), AskUserQuestionResultMessage() (+422 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (723): AddPermissionRules(), getAgentModelDisplay(), getAgentModelOptions(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk() (+715 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1157): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), axiosGetWithRetry(), createDefaultEnvironment() (+1149 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (649): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), registerMcpAddCommand(), deleteProvider(), resetProviderForm(), startEditingProvider() (+641 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (422): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+414 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (630): ActivityManager, getAgentColor(), setAgentColor(), getAgentContext(), getSubagentLogName(), isSubagentContext(), AgentDetail(), resolveAgentOverrides() (+622 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (378): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+370 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (583): createAbortController(), createChildAbortController(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt() (+575 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (484): getSettingsWithAllErrors(), normalizeToolInput(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress() (+476 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (396): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), consumeInvokingRequestId(), classifyHandoffIfNeeded() (+388 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (333): classifyBashCommand(), createPromptRuleContent(), getBashPromptAllowDescriptions(), getBashPromptAskDescriptions(), isClassifierPermissionsEnabled(), bashToolCheckCommandOperatorPermissions(), buildSegmentWithoutRedirections(), checkCommandOperatorPermissions() (+325 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (314): isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName(), getDefaultAppState(), TaskStatusMessage() (+306 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (165): withDiagnosticsTiming(), buildHookSchemas(), isBeingDebugged(), _a, aa, Ai(), as(), at() (+157 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (195): prependUserContext(), getAutoModeExitAttachment(), suppressNextSkillListing(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken() (+187 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (170): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), getAgentPendingMessageAttachments() (+162 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (181): canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), checkForAsyncHookResponses(), clearAllAsyncHooks(), finalizePendingAsyncHooks() (+173 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (129): getDefaultSubagentModel(), getOverrideSourceLabel(), resolveAgentModelDisplay(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath() (+121 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (158): appendSystemContext(), readClientSecret(), getClaudeDesktopConfigPath(), readClaudeDesktopMcpServers(), getMcpServerConnectionBatchSize(), getMcpToolsCommandsAndResources(), getRemoteMcpServerConnectionBatchSize(), processBatched() (+150 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (108): AuthCodeListener, refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled() (+100 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (111): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost() (+103 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (124): onSelect(), contentContainsImages(), inferCompactSchema(), persistBlobToTextBlock(), processMCPResult(), transformMCPResult(), transformResultContent(), getHostPlatformForAnalytics() (+116 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (90): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+82 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (113): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+105 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (45): extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger() (+37 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (73): eagerParseCliFlag(), parseSettingSourcesFlag(), consumeEarlyInput(), processChunk(), startCapturingEarlyInput(), stopCapturingEarlyInput(), filterExistingPaths(), getKnownPathsForRepo() (+65 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (55): CircularBuffer, getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), bootstrapTelemetry() (+47 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (20): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (32): agenticSessionSearch(), count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled(), runFilePersistence() (+24 more)

### Community 30 - "Community 30"
Cohesion: 0.08
Nodes (15): getBridgeDisabledReason(), getCcrAutoConnectDefault(), getOauthAccountInfo(), hasProfileScope(), isBridgeEnabled(), isBridgeEnabledBlocking(), isCcrMirrorEnabled(), isClaudeAISubscriber() (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (22): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField(), updateValidationError() (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (12): clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync(), getActiveConfig() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (11): detectGitOperation(), findPrInStdout(), gitCmdRe(), parseGitCommitId(), parseGitPushBranch(), parsePrNumberFromText(), parsePrUrl(), parseRefFromCommand() (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (9): getRenderContext(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 38 - "Community 38"
Cohesion: 0.51
Nodes (10): getMessageType(), isRecord(), normalizeImageUrl(), normalizeOne(), normalizeOpenAiContent(), normalizeOpenAiMessage(), normalizeRole(), normalizeToolCalls() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 40 - "Community 40"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 41 - "Community 41"
Cohesion: 0.46
Nodes (7): forceStopPreventSleep(), killCaffeinate(), spawnCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 44 - "Community 44"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 48 - "Community 48"
Cohesion: 0.47
Nodes (3): formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput()

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (3): getTaskAssignmentSummary(), tryRenderTaskAssignmentMessage(), isTaskAssignment()

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 194 - "Community 194"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 28`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 194`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 29`, `Community 39`, `Community 40`, `Community 41`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 27`, `Community 40`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 38`, `Community 41`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._