# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2412 files · ~2,279,613 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14188 nodes · 45005 edges · 48 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15340 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 191|Community 191]]

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
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `deserializeLogEntry()` --calls--> `jsonParse()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\slowOperations.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (460): getAgentModelOptions(), AgentNavigationFooter(), splitSysPromptPrefix(), createApiQueryHook(), _temp(), parseArgumentNames(), AskUserQuestionResultMessage(), countAutoModeAttachmentsSinceLastExit() (+452 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1196): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet(), resolveTeamName() (+1188 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (839): registerMcpAddCommand(), optionForPermissionSaveDestination(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting() (+831 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (398): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+390 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (506): getAgentModelDisplay(), AgentEditor(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider(), useAppState(), useAppStateMaybeOutsideOfProvider() (+498 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (670): createAbortController(), createChildAbortController(), ActivityManager, getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel(), resolveAgentOverrides() (+662 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (553): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+545 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (385): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi() (+377 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (299): classifyHandoffIfNeeded(), getAutoModeExitAttachment(), getDateChangeAttachments(), getMaxBudgetUsdAttachment(), getOutputTokenUsageAttachment(), is1PApiCustomer(), isGateOpen(), autoModeConfigHandler() (+291 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (342): call(), normalizeToolInput(), prependUserContext(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getAgentListingDeltaAttachment(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment() (+334 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (220): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath() (+212 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (271): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+263 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (242): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), AbortError, createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+234 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (230): filterToolsForAgent(), countCustomAgentTokens(), countSystemTokens(), appendSystemContext(), filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames() (+222 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (250): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), onSelect(), buildCommandParts(), containsControlStructure(), findFirstPipeOperator() (+242 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (210): countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getAttributionTexts(), getEnhancedPRAttribution(), getPRAttributionData(), getTranscriptStats(), isTerminalOutput() (+202 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (189): formatTime(), axiosGetWithRetry(), logAPIPrefix(), InvalidApiKeyMessage(), AuthenticationCancelledError, checkAndRefreshOAuthTokenIfNeededImpl(), ClaudeAuthProvider, clearMcpClientConfig() (+181 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (134): getValue(), withDiagnosticsTiming(), withStatsCacheLock(), _a, aa, Ai(), as(), at() (+126 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (151): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+143 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (148): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getConfig() (+140 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (118): AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent(), formatMessagesForContext() (+110 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (115): BaseTextInput(), contentContainsImages(), inferCompactSchema(), persistBlobToTextBlock(), processMCPResult(), transformMCPResult(), transformResultContent(), shouldMaintainProjectWorkingDir() (+107 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (112): AddPermissionRules(), ComputerUseAppListPanel(), looksLikeISO8601(), DiffDialog(), turnDiffToDiffData(), commitTextField(), handleNavigation(), handleTextInputChange() (+104 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (55): createBashShellProvider(), CircularBuffer, buildAuthUrl(), _temp8(), validateBoundedIntEnvVar(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig() (+47 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (78): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), resolveSkillFilePath(), writeSkillFiles(), buildInlineReference(), buildPrompt() (+70 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (20): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+12 more)

### Community 27 - "Community 27"
Cohesion: 0.07
Nodes (20): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments() (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (29): validateUrl(), handleKeyDown(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown() (+21 more)

### Community 29 - "Community 29"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 36 - "Community 36"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 37 - "Community 37"
Cohesion: 0.51
Nodes (10): getMessageType(), isRecord(), normalizeImageUrl(), normalizeOne(), normalizeOpenAiContent(), normalizeOpenAiMessage(), normalizeRole(), normalizeToolCalls() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 40 - "Community 40"
Cohesion: 0.46
Nodes (7): forceStopPreventSleep(), killCaffeinate(), spawnCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 42 - "Community 42"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 47 - "Community 47"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 60 - "Community 60"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 191 - "Community 191"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 29`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 31`, `Community 32`, `Community 40`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 24`, `Community 26`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 31`, `Community 37`, `Community 40`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._