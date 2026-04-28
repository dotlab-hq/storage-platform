# Graph Report - storage-platform  (2026-04-28)

## Corpus Check
- 2519 files · ~2,324,874 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14610 nodes · 45373 edges · 59 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15357 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 228|Community 228]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 321 edges
5. `String()` - 204 edges
6. `jsonStringify()` - 200 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (369): getAgentModelOptions(), extractTranscript(), logContainsQuery(), AbortError, getSettingsWithAllErrors(), isSignedIn(), createApiQueryHook(), uniq() (+361 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1168): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), formatAgentId(), parseAgentId(), axiosGetWithRetry(), isTransientNetworkError(), getTerminalSize() (+1160 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (632): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), AnimatedAsterisk(), AnimatedClawd(), hold(), useClawdAnimation() (+624 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (565): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+557 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (782): getContextFromEvent(), isApiEvent(), logActivity(), listAdminProviderContents(), getAgentColor(), setAgentColor(), AgentDetail(), getOverrideSourceLabel() (+774 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (817): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+809 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (391): call(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), getBidi(), hasRTLCharacters() (+383 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (622): createAbortController(), createChildAbortController(), ActivityManager, runWithAgentContext(), getLocalAgentMemoryDir(), getSessionMessages(), flushAsciicastRecorder(), getRecordFilePath() (+614 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (504): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests() (+496 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (395): normalizePrefix(), toFileEntry(), toFolderEntry(), countToolUses(), finalizeAgentTool(), normalizeToolInput(), prependUserContext(), parseArguments() (+387 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (368): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+360 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (142): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+134 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (200): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+192 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (176): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), buildDeepLinkBanner(), mtimeOrUndefined() (+168 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (134): emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages() (+126 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (152): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent() (+144 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (114): generateFileAttachment(), tryGetPDFReference(), callMCPTool(), contentContainsImages(), getMcpToolTimeoutMs(), isMcpSessionExpiredError(), persistBlobToTextBlock(), processMCPResult() (+106 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (91): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+83 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (58): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), createServiceUnavailableResponse(), ab() (+50 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (109): registerMcpAddCommand(), isAutoModeAllowlistedTool(), eagerParseCliFlag(), recordDenial(), recordSuccess(), shouldFallbackToPrompting(), filterExistingPaths(), getKnownPathsForRepo() (+101 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (52): getOutputTokenUsageAttachment(), AuthCodeListener, BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), CCRClient (+44 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (91): consumeInvokingRequestId(), getAgentContext(), getSubagentLogName(), isSubagentContext(), classifyAPIError(), extractConnectionErrorDetails(), extractNestedErrorMessage(), formatAPIError() (+83 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (89): withActivityLogging(), filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), ChromeMessageReader, ChromeNativeHost, log() (+81 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (59): finalizeHook(), CircularBuffer, buildAuthUrl(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars() (+51 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (103): applySettingsChange(), _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken() (+95 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 27 - "Community 27"
Cohesion: 0.05
Nodes (56): AddPermissionRules(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), parseNaturalLanguageDateTime(), commitTextField() (+48 more)

### Community 28 - "Community 28"
Cohesion: 0.07
Nodes (28): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+20 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (22): handleMediaInputChange(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize(), getErrorMessage(), uploadFileViaProxy() (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.16
Nodes (10): extractIncludePathsFromTokens(), handleMemoryFileReadError(), parseMemoryFileContent(), safelyReadMemoryFileAsync(), stripHtmlComments(), stripHtmlCommentsFromTokens(), NS, sd() (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.16
Nodes (17): createDeepAgentGraph(), createAgentNode(), parseToolCallChunks(), buildSupervisorGraph(), createAgentNode(), createSupervisorNode(), supervisorNode(), getMessageType() (+9 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (9): getPluginErrorMessage(), formatErrorMessage(), getErrorGuidance(), buildErrorRows(), buildMarketplaceAction(), buildPluginAction(), getExtraMarketplaceSourceInfo(), getPluginNameFromError() (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

### Community 40 - "Community 40"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (5): ConfirmationAccepted(), ConfirmationActions(), ConfirmationRejected(), ConfirmationRequest(), useConfirmation()

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (2): MicSelector(), useAudioDevices()

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 47 - "Community 47"
Cohesion: 0.46
Nodes (7): forceStopPreventSleep(), killCaffeinate(), spawnCaffeinate(), startPreventSleep(), startRestartInterval(), stopPreventSleep(), stopRestartInterval()

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 52 - "Community 52"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 53 - "Community 53"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 58 - "Community 58"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 59 - "Community 59"
Cohesion: 0.47
Nodes (3): completeJsxTag(), matchJsxTag(), stripIncompleteTag()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 85 - "Community 85"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 228 - "Community 228"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 45`** (9 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 228`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`, `Community 30`, `Community 47`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 27`, `Community 34`, `Community 52`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 22`, `Community 23`, `Community 25`, `Community 27`, `Community 31`, `Community 47`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 320 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 320 INFERRED edges - model-reasoned connections that need verification._