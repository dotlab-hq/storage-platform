# Graph Report - storage-platform  (2026-05-29)

## Corpus Check
- 2435 files · ~2,282,675 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14232 nodes · 45047 edges · 51 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15358 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 200|Community 200]]

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
- `formatPastedTextRef()` --calls--> `recollapsePastedContent()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\promptEditor.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (560): canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), getAgentModelOptions(), isTeammateAgentContext(), extractTranscript() (+552 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (682): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+674 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1177): withActivityLogging(), getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), parseAgentId(), appendSystemContext(), axiosGetWithRetry() (+1169 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (614): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+606 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (735): logActivity(), registerMcpAddCommand(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), triggerTrashCron() (+727 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (384): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+376 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (532): getContextFromEvent(), isApiEvent(), ActivityManager, getAgentColor(), setAgentColor(), AgentDetail(), resolveAgentOverrides(), resolveAgentTools() (+524 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (506): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+498 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (413): call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor(), aliasMatchesParentTier(), getAgentModel(), getDefaultSubagentModel(), classifyHandoffIfNeeded() (+405 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (364): createAbortController(), createChildAbortController(), getSessionMessages(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+356 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (352): getAgentContext(), getSubagentLogName(), isSubagentContext(), normalizeToolInput(), prependUserContext(), count(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage() (+344 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (289): getAutoBackgroundMs(), getOpenedFileFromIDE(), getSelectedLinesFromIDE(), isFileReadDenied(), getOauthAccountInfo(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox() (+281 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (285): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), consumeInvokingRequestId(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+277 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (198): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath() (+190 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (193): clearAllAsyncHooks(), finalizePendingAsyncHooks(), resetSentSkillNames(), checkAndRefreshOAuthTokenIfNeeded(), clearApiKeyHelperCache(), clearAwsCredentialsCache(), clearGcpCredentialsCache(), clearOAuthTokenCache() (+185 more)

### Community 15 - "Community 15"
Cohesion: 0.03
Nodes (63): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+55 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (106): contentContainsImages(), processMCPResult(), _temp8(), shouldMaintainProjectWorkingDir(), validateBoundedIntEnvVar(), createImageResponse(), readImageWithTokenBudget(), getWebFetchUserAgent() (+98 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (75): getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint() (+67 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (102): getSettingsWithAllErrors(), readClientSecret(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), getMcpServerConnectionBatchSize() (+94 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (81): finalizeHook(), CircularBuffer, queryHaiku(), queryWithModel(), buildAuthUrl(), CompactSummary(), parseNaturalLanguageDateTime(), stripIdeContextTags() (+73 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (69): CCRClient, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled(), findChannelEntry(), gateChannelServer(), getEffectiveChannelAllowlist(), createChannelPermissionCallbacks() (+61 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (92): collapseReadSearchGroups(), commandAsHint(), countToolUses(), createCollapsedGroup(), createEmptyGroup(), getCollapsibleToolInfo(), getDisplayMessageFromCollapsed(), getFilePathFromToolInput() (+84 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (70): BridgeFatalError, extractErrorTypeFromData(), handleErrorStatus(), isExpiredErrorType(), isSuppressible403(), validateBridgeId(), addJitter(), BridgeHeadlessPermanentError (+62 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (25): getOverrideSourceLabel(), resolveAgentModelDisplay(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath() (+17 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (60): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+52 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (74): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), getValue(), ApplyEffortAndClose(), call(), convertEffortValueToLevel() (+66 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (60): applyBedrockRegionPrefix(), createBedrockClient(), createBedrockRuntimeClient(), extractModelIdFromArn(), findFirstMatch(), getBedrockRegionPrefix(), isFoundationModel(), getHasFormattedOutput() (+52 more)

### Community 27 - "Community 27"
Cohesion: 0.03
Nodes (36): validateUrl(), collectListeners(), Dispatcher, getEventPriority(), getHandler(), processDispatchQueue(), EventEmitter, Event (+28 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (56): AddPermissionRules(), getSourceDisplayName(), call(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation() (+48 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (38): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isLockHeldLocally(), timeoutReject() (+30 more)

### Community 31 - "Community 31"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 32 - "Community 32"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (27): getDiagnosticAttachments(), callIdeRpc(), callMCPTool(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), detectCodeIndexingFromMcpServerName(), addCronTask(), getCronFilePath() (+19 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 36 - "Community 36"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (5): useS3ViewerDelete(), useS3ViewerFolder(), useS3ViewerQuery(), useS3ViewerUpload(), useS3BucketViewer()

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 40 - "Community 40"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 42 - "Community 42"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (2): fireRawRead(), startMdmRawRead()

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (2): getTeammateThemeColor(), PromptInputModeIndicator()

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 200 - "Community 200"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 31`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (7 nodes): `constants.ts`, `rawRead.ts`, `getMacOSPlistPaths()`, `execFilePromise()`, `fireRawRead()`, `getMdmRawReadPromise()`, `startMdmRawRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `PromptInputModeIndicator.tsx`, `getTeammateThemeColor()`, `PromptChar()`, `PromptInputModeIndicator()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 200`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 18`, `Community 19`, `Community 22`, `Community 24`, `Community 29`, `Community 33`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `logError()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 22`, `Community 27`, `Community 29`, `Community 33`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._