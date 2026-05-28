# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2414 files · ~2,279,713 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14193 nodes · 45014 edges · 52 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15344 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 196|Community 196]]

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
- `round()` --calls--> `formatDuration()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\bridge\jwtUtils.ts
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (367): getAgentModelOptions(), createApiQueryHook(), uniq(), AskUserQuestionWithHighlight(), InvalidApiKeyMessage(), collectSurfacedMemories(), countAutoModeAttachmentsSinceLastExit(), extractAgentMentions() (+359 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (594): ActivityManager, formatTime(), cn(), buildCommandParts(), containsControlStructure(), findFirstPipeOperator(), isCommandSeparator(), isEnvironmentVariableAssignment() (+586 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (967): registerMcpAddCommand(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), call(), getAdvisorUsage(), isValidAdvisorModel(), modelSupportsAdvisor() (+959 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (778): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+770 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (725): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), appendSystemContext(), applySettingsChange(), AskUserQuestionResultMessage(), getDirectoriesToProcess(), getNestedMemoryAttachments() (+717 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (420): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), BaseTextInput(), getBidi(), hasRTLCharacters() (+412 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (454): formatAgentId(), parseAgentId(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+446 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (434): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider(), _temp() (+426 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (495): isAgentMemoryPath(), logContextMetrics(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc() (+487 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (506): canUserConfigureAdvisor(), getAdvisorConfig(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isTeammateAgentContext(), call(), isAgentSwarmsEnabled() (+498 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (478): createAbortController(), createChildAbortController(), getSessionMessages(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+470 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (124): getOutputTokenUsageAttachment(), AuthCodeListener, CCRClient, CircularBuffer, getMemoryPath(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), drainer() (+116 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (231): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+223 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (161): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+153 more)

### Community 14 - "Community 14"
Cohesion: 0.02
Nodes (183): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getAttributionTexts() (+175 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (166): AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata(), getMcpClientConfig(), getScopeFromMetadata() (+158 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (154): getAgentContext(), getSubagentLogName(), isSubagentContext(), prependUserContext(), suppressNextSkillListing(), Byline(), getCommandName(), findCommand() (+146 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (131): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+123 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (71): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+63 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (143): loadAgentMemoryPrompt(), parseArgumentNames(), parseArguments(), substituteArguments(), collapseReadSearchGroups(), commandAsHint(), countToolUses(), createCollapsedGroup() (+135 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (111): AddPermissionRules(), call(), collectContextData(), formatContextAsMarkdownTable(), CollapseStatus(), looksLikeISO8601(), parseNaturalLanguageDateTime(), commitTextField() (+103 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (102): generateFileAttachment(), getOpenedFileFromIDE(), getSelectedLinesFromIDE(), isFileReadDenied(), tryGetPDFReference(), ComputerUseAppListPanel(), escapeForDiff(), getPatchForDisplay() (+94 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (100): ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), encodePng(), fillBackground(), roundCorners() (+92 more)

### Community 23 - "Community 23"
Cohesion: 0.02
Nodes (89): getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode(), validateUrl() (+81 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (71): BypassPermissionsModeDialog(), _temp(), _temp2(), eagerParseCliFlag(), DevChannelsDialog(), _temp(), consumeEarlyInput(), processChunk() (+63 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (20): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+12 more)

### Community 26 - "Community 26"
Cohesion: 0.03
Nodes (36): extractTranscript(), logContainsQuery(), AbortError, BoundedUUIDSet, extractTitleText(), handleIngressMessage(), handleServerControlRequest(), isSDKControlRequest() (+28 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (71): classifyHandoffIfNeeded(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules(), getBashPromptDenyDescriptions(), isAutoModeAllowlistedTool() (+63 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (60): clearCACertsCache(), getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), bootstrapTelemetry() (+52 more)

### Community 30 - "Community 30"
Cohesion: 0.1
Nodes (35): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+27 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (8): extractIncludePathsFromTokens(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), NS, sd(), Wn(), ia

### Community 33 - "Community 33"
Cohesion: 0.14
Nodes (17): collectDirectoryNames(), getClaudeConfigFiles(), getDirectoryNames(), getDirectoryNamesAsync(), getFileIndex(), getGitIndexMtime(), getPathsForSuggestions(), mergeUntrackedIntoNormalizedCache() (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (6): mapBreadcrumbs(), mapItems(), getActiveUploadCount(), useUploadStore(), mapInitialData(), useStorageData()

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (4): filterToolsForAgent(), getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

### Community 39 - "Community 39"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 40 - "Community 40"
Cohesion: 0.42
Nodes (8): debug(), extractInboundAttachments(), prependPathRefs(), resolveAndPrepend(), resolveInboundAttachments(), resolveOne(), sanitizeFileName(), uploadsDir()

### Community 41 - "Community 41"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 42 - "Community 42"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (7): expandIPv6Groups(), extractMappedIPv4(), isBlockedAddress(), isBlockedV4(), isBlockedV6(), ssrfError(), ssrfGuardedLookup()

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 49 - "Community 49"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 62 - "Community 62"
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

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 42`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 33`, `Community 40`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 28`, `Community 40`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 24`, `Community 26`, `Community 28`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._