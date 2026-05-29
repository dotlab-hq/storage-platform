# Graph Report - storage-platform  (2026-05-30)

## Corpus Check
- 2454 files · ~2,288,634 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14328 nodes · 45779 edges · 62 communities detected
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
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 211|Community 211]]

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
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `qC()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `formatPastedTextRef()` --calls--> `recollapsePastedContent()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\promptEditor.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (1779): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), getAgentContext(), agenticSessionSearch() (+1771 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (508): getAgentModelOptions(), getAgentColor(), setAgentColor(), AgentDetail(), extractTranscript(), logContainsQuery(), AbortError, filterToolsForAgent() (+500 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (710): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), useAppState(), useAppStateMaybeOutsideOfProvider() (+702 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (1001): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+993 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (455): formatTime(), cn(), getWatchTargets(), initialize(), parseFrontmatterPaths(), af(), ef(), ff() (+447 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (637): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+629 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (565): parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+557 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (332): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), shouldSkipVersion(), getBidi(), hasRTLCharacters() (+324 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (305): createAbortController(), createChildAbortController(), getSessionMessages(), emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments() (+297 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (209): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+201 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (144): hashFileContent(), hashFilePath(), logFileOperation(), computeFingerprint(), computeFingerprintFromMessages(), extractFirstMessageText(), _a, aa (+136 more)

### Community 11 - "Community 11"
Cohesion: 0.02
Nodes (184): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath() (+176 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (193): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), getCommandName() (+185 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (156): generateFileAttachment(), tryGetPDFReference(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), transformResultContent(), isClaudeInChromeMCPServer(), escapeForDiff() (+148 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (78): AuthCodeListener, accumulateStreamEvents(), CCRClient, clearStreamAccumulatorForMessage(), scopeKey(), getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled() (+70 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (127): AddPermissionRules(), AppStateProvider(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, installSelectedPlugins(), call() (+119 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (122): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), decodeFont(), encodePng(), fillBackground() (+114 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (90): getSubagentLogName(), isSubagentContext(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), getMemoryScopeDisplay(), isAgentMemoryPath(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath() (+82 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (74): ActivityManager, filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isComputerUseMCPServer() (+66 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (83): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), resolveSkillFilePath(), writeSkillFiles(), buildInlineReference(), buildPrompt() (+75 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (61): applyBedrockRegionPrefix(), createBedrockClient(), createBedrockRuntimeClient(), extractModelIdFromArn(), findFirstMatch(), getBedrockRegionPrefix(), isFoundationModel(), getHasFormattedOutput() (+53 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (77): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), consumeEarlyInput(), processChunk(), startCapturingEarlyInput(), stopCapturingEarlyInput() (+69 more)

### Community 23 - "Community 23"
Cohesion: 0.04
Nodes (60): ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), getAllSocketPaths(), getAllWindowsRegistryKeys(), getSecureSocketPath() (+52 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (59): parseEsc(), addLineNumber(), addMarker(), ansi256FromRgb(), ansiIdx(), applyBackground(), asTerminalEscaped(), buildTheme() (+51 more)

### Community 26 - "Community 26"
Cohesion: 0.05
Nodes (55): count(), countWorktreeChanges(), executeBYOCPersistence(), executeCloudPersistence(), buildDownloadPath(), downloadAndSaveFile(), downloadFile(), downloadSessionFiles() (+47 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (34): validateUrl(), handler(), handleKeyDown(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown() (+26 more)

### Community 28 - "Community 28"
Cohesion: 0.07
Nodes (52): getAnthropicApiKeyWithSource(), getApiKeyFromApiKeyHelperCached(), hasAnthropicApiKeyAuth(), isCustomApiKeyApproved(), getApiKeyFromFileDescriptor(), normalizeApiKeyForConfig(), notifyChange(), clearPolicyLimitsCache() (+44 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (42): consumeInvokingRequestId(), AutoUpdater(), DevBar(), shouldShowDevBar(), _temp(), classifyAPIError(), extractConnectionErrorDetails(), extractNestedErrorMessage() (+34 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (39): getProjectDir(), sanitizePath(), addCleanupResults(), cleanupOldDebugLogs(), cleanupOldFileHistoryBackups(), cleanupOldFilesInDirectory(), cleanupOldMessageFiles(), cleanupOldMessageFilesInBackground() (+31 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (31): getTaskReminderAttachments(), findAvailableTask(), formatTaskAsPrompt(), tryClaimNextTask(), blockTask(), clearLeaderTeamName(), createTask(), deleteTask() (+23 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (9): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), maybeRecordPluginHint(), Mailbox, useMailbox() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (16): getPermissionRulesForSource(), settingsJsonToRules(), getApiKeyHelperSources(), getAwsCommandsSources(), getBashPermissionSources(), getDangerousEnvVarsSources(), getGcpCommandsSources(), getHooksSources() (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (6): mapBreadcrumbs(), mapItems(), getActiveUploadCount(), useUploadStore(), mapInitialData(), useStorageData()

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (11): detectGitOperation(), findPrInStdout(), gitCmdRe(), parseGitCommitId(), parseGitPushBranch(), parsePrNumberFromText(), parsePrUrl(), parseRefFromCommand() (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 42 - "Community 42"
Cohesion: 0.24
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 43 - "Community 43"
Cohesion: 0.2
Nodes (5): useS3ViewerDelete(), useS3ViewerFolder(), useS3ViewerQuery(), useS3ViewerUpload(), useS3BucketViewer()

### Community 44 - "Community 44"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 45 - "Community 45"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (5): call(), getBridgeDebugHandle(), injectBridgeFault(), registerBridgeDebugHandle(), wrapApiForFaultInjection()

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 50 - "Community 50"
Cohesion: 0.52
Nodes (6): forceStopPreventSleep(), killCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 51 - "Community 51"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (3): fileNameWords(), getVoiceKeyterms(), splitIdentifier()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (2): loadProviderContents(), toErrorMessage()

### Community 68 - "Community 68"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 69 - "Community 69"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (2): ExitFlow(), getRandomGoodbyeMessage()

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (1): sendDirectMemberMessage()

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (2): createS3Client(), readRequiredEnv()

### Community 211 - "Community 211"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 44`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `getProviderObjectUrl()`, `loadProviderContents()`, `toErrorMessage()`, `provider-contents-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (3 nodes): `ExitFlow.tsx`, `ExitFlow()`, `getRandomGoodbyeMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (3 nodes): `directMemberMessage.ts`, `parseDirectMemberMessage()`, `sendDirectMemberMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (3 nodes): `createS3Client()`, `readRequiredEnv()`, `s3-compat.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 211`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 39`, `Community 42`, `Community 45`, `Community 46`, `Community 50`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `logError()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 25`, `Community 26`, `Community 29`, `Community 30`, `Community 37`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 17`, `Community 20`, `Community 22`, `Community 23`, `Community 25`, `Community 29`, `Community 32`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 334 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 334 INFERRED edges - model-reasoned connections that need verification._