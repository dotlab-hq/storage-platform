# Graph Report - storage-platform  (2026-05-23)

## Corpus Check
- 2400 files · ~2,273,629 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14145 nodes · 44907 edges · 50 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15295 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 193|Community 193]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 317 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
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
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts
- `setup()` --calls--> `generateTmuxSessionName()`  [INFERRED]
  claude-code-source-main\src\setup.ts → claude-code-source-main\src\utils\worktree.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (448): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), isAgentMemoryPath(), formatAgent(), AbortError (+440 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (581): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+573 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (840): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, deleteProvider(), resetProviderForm(), startEditingProvider() (+832 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (905): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), getSettingsWithAllErrors(), appendSystemContext(), parseArgumentNames(), parseArguments(), substituteArguments() (+897 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (741): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+733 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (626): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), isTeammateAgentContext(), formatAgentId(), parseAgentId(), isAgentSwarmsEnabled(), isAgentTeamsFlagSet() (+618 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (429): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), extractSandboxViolations(), getBidi(), hasRTLCharacters() (+421 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (534): createAbortController(), createChildAbortController(), getActualRelativeAgentFilePath(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), call(), getSessionMessages(), getAutoBackgroundMs() (+526 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (426): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider() (+418 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (350): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+342 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (227): getAgentMemoryDir(), getAgentMemoryEntrypoint(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent(), getSnapshotJsonPath() (+219 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (288): getAgentContext(), getSubagentLogName(), isSubagentContext(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+280 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (214): getAdvisorUsage(), getAutoModeExitAttachment(), getDateChangeAttachments(), getMaxBudgetUsdAttachment(), getOutputTokenUsageAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken() (+206 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (182): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath() (+174 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (205): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), checkBridgePrerequisites(), call(), BridgeFatalError, createBridgeApiClient() (+197 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (214): normalizeToolInput(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments(), getPlanModeExitAttachment(), resetSentSkillNames() (+206 more)

### Community 16 - "Community 16"
Cohesion: 0.03
Nodes (77): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+69 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (118): setMockBillingAccessOverride(), Byline(), handleCoordinatorPermission(), cleanupPath(), ErrorOverview(), getStackUtils(), shortErrorStack(), toError() (+110 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (127): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), openPath() (+119 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (109): generateFileAttachment(), tryGetPDFReference(), BaseTextInput(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), getFileModificationTimeAsync(), callInner() (+101 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (89): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles(), buildInlineReference() (+81 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (55): finalizeHook(), CircularBuffer, buildAuthUrl(), _temp8(), validateBoundedIntEnvVar(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig() (+47 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (58): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+50 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (78): AddPermissionRules(), getOverrideSourceLabel(), ComputerUseAppListPanel(), getSourceDisplayName(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus() (+70 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (68): AuthCodeListener, addBetaInteractionAttributes(), addBetaLLMRequestAttributes(), addBetaLLMResponseAttributes(), addBetaToolInputAttributes(), addBetaToolResultAttributes(), extractSystemReminderContent(), formatMessagesForContext() (+60 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (53): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), getCommandName(), applyCommandSuggestion(), createCommandSuggestionItem() (+45 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (81): buildCacheSafeParams(), stripInProgressAssistantMessage(), getPromptContent(), getPromptContent(), attributionRestoreStateFromLog(), computeContentHash(), computeFileModificationState(), createEmptyAttributionState() (+73 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (20): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+12 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (49): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+41 more)

### Community 30 - "Community 30"
Cohesion: 0.04
Nodes (31): validateUrl(), handler(), handleKeyDown(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown() (+23 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (31): agenticSessionSearch(), count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence() (+23 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (11): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 42 - "Community 42"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 48 - "Community 48"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 59 - "Community 59"
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

### Community 193 - "Community 193"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 40`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 29`, `Community 33`, `Community 34`, `Community 38`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 17` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 31`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 316 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 316 INFERRED edges - model-reasoned connections that need verification._