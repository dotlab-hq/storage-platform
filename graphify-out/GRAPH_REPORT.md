# Graph Report - storage-platform  (2026-05-30)

## Corpus Check
- 2454 files · ~2,288,846 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14329 nodes · 45781 edges · 46 communities detected
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 15959 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 196|Community 196]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 335 edges
5. `now()` - 276 edges
6. `jsonStringify()` - 200 edges
7. `String()` - 193 edges
8. `errorMessage()` - 184 edges
9. `errorMessage()` - 183 edges
10. `isEnvTruthy()` - 175 edges

## Surprising Connections (you probably didn't know these)
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `qC()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `deserializeLogEntry()` --calls--> `jsonParse()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\slowOperations.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (490): extractTranscript(), logContainsQuery(), AbortError, getSettingsWithAllErrors(), createApiQueryHook(), AppStateProvider(), _temp(), uniq() (+482 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (675): getAgentColor(), AgentDetail(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep() (+667 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1041): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, deleteProvider(), submitProvider(), toggleProviderAvailability() (+1033 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (1025): registerMcpAddCommand(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), getAgentContext(), getSubagentLogName(), isSubagentContext(), agenticSessionSearch() (+1017 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (449): resetProviderForm(), startEditingProvider(), af(), ef(), ff(), Ja(), lf(), mt() (+441 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (788): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+780 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (357): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters(), needsBidi() (+349 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (478): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), readClientSecret(), getApiKeyFromFileDescriptor(), getCredentialFromFd(), getOAuthTokenFromFileDescriptor(), maybePersistTokenForSubprocesses() (+470 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (364): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+356 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (389): countToolUses(), finalizeAgentTool(), normalizeToolInput(), prependUserContext(), count(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getCompactionReminderAttachment() (+381 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (323): createAbortController(), createChildAbortController(), getSessionMessages(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths(), getTerminalSize(), installAsciicastRecorder() (+315 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (286): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+278 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (174): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer(), isLockHeldLocally() (+166 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (227): generateRequestId(), isTransientNetworkError(), memoryHeader(), suppressNextSkillListing(), detectMimeTypeFromPath(), generateAudio(), toWav(), transcribeAudio() (+219 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (236): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), buildDeepLinkBanner() (+228 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (215): consumeInvokingRequestId(), logAPIPrefix(), splitSysPromptPrefix(), generateFileAttachment(), tryGetPDFReference(), onSelect(), buildCommandParts(), containsControlStructure() (+207 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (141): checkAndRefreshOAuthTokenIfNeeded(), CCRClient, notifyChange(), CircularBuffer, getMemoryPath(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), classifyAxiosError() (+133 more)

### Community 17 - "Community 17"
Cohesion: 0.01
Nodes (168): emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle(), ansiToPng(), blitGlyph(), blitShade(), chunk() (+160 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (58): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, consumeEarlyInput() (+50 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (98): AddPermissionRules(), getSourceDisplayName(), call(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation() (+90 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (82): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage() (+74 more)

### Community 21 - "Community 21"
Cohesion: 0.05
Nodes (30): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), NS, sd(), Wn() (+22 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 23 - "Community 23"
Cohesion: 0.05
Nodes (63): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), checkAndDisableAutoModeIfNeeded() (+55 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (48): validateUrl(), handler(), handleKeyDown(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown() (+40 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (45): executeUserInput(), handlePromptSubmit(), clearHeadlessMarks(), headlessProfilerCheckpoint(), headlessProfilerStartTurn(), addToHistory(), addToPromptHistory(), clearPendingHistoryEntries() (+37 more)

### Community 26 - "Community 26"
Cohesion: 0.06
Nodes (48): parseEsc(), addLineNumber(), addMarker(), ansi256FromRgb(), ansiIdx(), applyBackground(), asTerminalEscaped(), buildTheme() (+40 more)

### Community 27 - "Community 27"
Cohesion: 0.07
Nodes (51): contentContainsImages(), inferCompactSchema(), processMCPResult(), transformMCPResult(), createImageResponse(), readImageWithTokenBudget(), asImageFilePath(), getClipboardCommands() (+43 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (42): parseArgumentNames(), ApplyEffortAndClose(), call(), convertEffortValueToLevel(), executeEffort(), getDisplayedEffortLevel(), getEffortEnvOverride(), getEffortLevelDescription() (+34 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 30 - "Community 30"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 33 - "Community 33"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 34 - "Community 34"
Cohesion: 0.2
Nodes (5): useS3ViewerDelete(), useS3ViewerFolder(), useS3ViewerQuery(), useS3ViewerUpload(), useS3BucketViewer()

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 39 - "Community 39"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (2): loadProviderContents(), toErrorMessage()

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 36`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `getProviderObjectUrl()`, `loadProviderContents()`, `toErrorMessage()`, `provider-contents-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 23`, `Community 26`, `Community 27`, `Community 28`, `Community 30`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `logError()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 21`, `Community 24`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 334 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 334 INFERRED edges - model-reasoned connections that need verification._