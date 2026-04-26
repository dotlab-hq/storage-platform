# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2466 files · ~2,309,129 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14457 nodes · 45012 edges · 61 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15141 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 230|Community 230]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 312 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 196 edges
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
Nodes (337): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), formatAgent(), createApiQueryHook(), _temp() (+329 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (819): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), App (+811 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1060): optionForPermissionSaveDestination(), formatAgentId(), parseAgentId(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+1052 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (592): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), extractAtMentionedFiles(), processAtMentionedFiles(), createLocalFallbackReply() (+584 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (1029): createAbortController(), createChildAbortController(), ActivityManager, getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), getAgentColor(), setAgentColor(), isTeammateAgentContext() (+1021 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (598): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+590 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (392): getAgentContext(), getSubagentLogName(), isSubagentContext(), agenticSessionSearch(), AbortError, countToolUses(), emitTaskProgress(), extractPartialResult() (+384 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (408): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+400 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (354): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry() (+346 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (418): AddPermissionRules(), applySettingsChange(), handleSinglePluginInstall(), installSelectedPlugins(), loadMarketplaceData(), loadPluginsForMarketplace(), clearBuiltinPlugins(), getBuiltinPluginDefinition() (+410 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (354): registerMcpAddCommand(), formatTime(), logAPIPrefix(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), getDynamicSkillAttachments(), resetSentSkillNames(), countMemoryFileAccessFromEntries() (+346 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (295): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), consumeInvokingRequestId(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+287 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (227): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), BridgeToggle(), checkBridgePrerequisites(), call(), BridgeFatalError (+219 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (253): clearApiKeyHelperCache(), getOauthAccountInfo(), isCustomApiKeyApproved(), readClientSecret(), normalizeApiKeyForConfig(), fetchBootstrapData(), getCcrAutoConnectDefault(), call() (+245 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (159): AuthCodeListener, is1PApiCustomer(), addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent() (+151 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (114): getOutputTokenUsageAttachment(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir() (+106 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (77): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), clearYogaNodeReferences(), createNode(), getFileExtension(), getMimeTypeFromFileName() (+69 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (76): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+68 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (76): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), CCRClient, notifyCommandLifecycle(), setCommandLifecycleListener() (+68 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (49): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, lastGrapheme() (+41 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (107): getMemoryScopeDisplay(), loadAgentMemoryPrompt(), collapseBackgroundBashNotifications(), isCompletedBackgroundBash(), collapseReadSearchGroups(), commandAsHint(), countToolUses(), createCollapsedGroup() (+99 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (53): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath() (+45 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (93): AutoUpdater(), contentContainsImages(), processMCPResult(), DevBar(), shouldShowDevBar(), _temp(), createImageResponse(), readImageWithTokenBudget() (+85 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (54): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+46 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (83): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), onSessionTimeout(), ChromeMessageReader, ChromeNativeHost, log() (+75 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (55): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), isClaudeMdExcluded(), resolveExcludePatterns(), collectDirectoryNames() (+47 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 27 - "Community 27"
Cohesion: 0.03
Nodes (73): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField(), updateValidationError() (+65 more)

### Community 28 - "Community 28"
Cohesion: 0.03
Nodes (59): getDiagnosticAttachments(), callIdeRpc(), ComputerUseAppListPanel(), ComputerUseTccPanel(), DiagnosticTrackingService, escapeForDiff(), getPatchForDisplay(), getPatchFromContents() (+51 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (13): finalizeHook(), CircularBuffer, buildAuthUrl(), getTaskOutput(), tailFile(), getMaxOutputLength(), prependStderr(), ShellCommandImpl (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (23): getSettingsWithAllErrors(), formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), countUnescapedChar(), hasUnescapedEmptyParens() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (3): filterToolsForAgent(), getToolBuckets(), ToolSelector()

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

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
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 47 - "Community 47"
Cohesion: 0.39
Nodes (6): detectFromColorFgBg(), getSystemThemeName(), hexComponent(), parseOscRgb(), resolveThemeSetting(), themeFromOscColor()

### Community 48 - "Community 48"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (2): getAutoModeDenials(), _temp()

### Community 51 - "Community 51"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 52 - "Community 52"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 65 - "Community 65"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 69 - "Community 69"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 81 - "Community 81"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 82 - "Community 82"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 230 - "Community 230"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 30`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (7 nodes): `getAutoModeDenials()`, `recordAutoModeDenial()`, `RecentDenialsTab.tsx`, `autoModeDenials.ts`, `_temp()`, `_temp2()`, `_temp3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 230`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 23`, `Community 24`, `Community 27`, `Community 29`, `Community 31`, `Community 34`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`, `Community 20`, `Community 23`, `Community 24`, `Community 28`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 311 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 311 INFERRED edges - model-reasoned connections that need verification._