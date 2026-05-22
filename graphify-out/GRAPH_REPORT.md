# Graph Report - storage-platform  (2026-05-22)

## Corpus Check
- 2400 files · ~2,273,496 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14144 nodes · 44903 edges · 47 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15293 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 190|Community 190]]

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
- `round()` --calls--> `_temp()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\components\DevBar.tsx
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `loadSettingsFromFlag()` --calls--> `setFlagSettingsPath()`  [INFERRED]
  claude-code-source-main\src\main.tsx → claude-code-source-main\src\bootstrap\state.ts
- `setup()` --calls--> `generateTmuxSessionName()`  [INFERRED]
  claude-code-source-main\src\setup.ts → claude-code-source-main\src\utils\worktree.ts
- `getOriginalCwd()` --calls--> `stdErrAppendShellResetMessage()`  [INFERRED]
  claude-code-source-main\src\bootstrap\state.ts → claude-code-source-main\src\tools\BashTool\utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (452): getAgentModelOptions(), getDefaultSubagentModel(), resolveAgentModelDisplay(), extractTranscript(), logContainsQuery(), isAgentMemoryPath(), formatAgent(), AbortError (+444 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1053): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), getSettingsWithAllErrors(), appendSystemContext(), applySettingsChange(), getLSPDiagnosticAttachments(), readClientSecret() (+1045 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (837): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+829 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (930): registerMcpAddCommand(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage() (+922 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (451): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+443 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (344): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), BaseTextInput(), getBidi(), hasRTLCharacters(), needsBidi() (+336 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (476): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), AnimatedAsterisk(), ApiKeyStep(), AppStateProvider(), useAppState() (+468 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (512): createAbortController(), createChildAbortController(), ActivityManager, getSessionMessages(), uniq(), flushAsciicastRecorder(), getRecordFilePath(), getSessionRecordingPaths() (+504 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (400): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+392 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (333): applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts(), nodeTypeId() (+325 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (327): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+319 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (255): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), areMcpConfigsEqual(), createCodeSession(), fetchRemoteCredentials() (+247 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (213): formatTime(), generateFileAttachment(), tryGetPDFReference(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch() (+205 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (164): withDiagnosticsTiming(), withStatsCacheLock(), _a, aa, Ai(), as(), at(), Bi (+156 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (226): getAgentContext(), getSubagentLogName(), isSubagentContext(), countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName() (+218 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (161): count(), checkAndRefreshOAuthTokenIfNeeded(), CCRClient, notifyChange(), getMemoryPath(), getDiagnosticLogFile(), logForDiagnosticsNoPII(), classifyAxiosError() (+153 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (121): finalizeHook(), getDiagnosticAttachments(), resetSentSkillNames(), clearSpeculativeChecks(), clearBetasCaches(), clearBetaTracingState(), clearCACertsCache(), clearSessionCaches() (+113 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (105): computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine (+97 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (148): checkBridgePrerequisites(), call(), BridgeFatalError, createBridgeApiClient(), extractErrorTypeFromData(), handleErrorStatus(), isExpiredErrorType(), isSuppressible403() (+140 more)

### Community 19 - "Community 19"
Cohesion: 0.02
Nodes (98): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles(), buildInlineReference() (+90 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (104): _temp(), getAutoModeExitAttachment(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken(), setAutoModeActive(), setAutoModeCircuitBroken(), modelSupportsAutoMode() (+96 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (100): buildAwaySummaryPrompt(), generateAwaySummary(), extractSandboxViolations(), buildCacheSafeParams(), stripInProgressAssistantMessage(), queryHaiku(), queryModelWithoutStreaming(), queryWithModel() (+92 more)

### Community 22 - "Community 22"
Cohesion: 0.02
Nodes (61): getOutputTokenUsageAttachment(), AuthCodeListener, getChannelAllowlist(), isChannelAllowlisted(), isChannelsEnabled(), findChannelEntry(), gateChannelServer(), getEffectiveChannelAllowlist() (+53 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (70): AddPermissionRules(), CollapseStatus(), looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), resolveFieldAsync() (+62 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (79): AskUserQuestionWithHighlight(), ClickableImageRef(), getCliHighlightPromise(), getLanguageName(), loadCliHighlight(), onImagePaste(), cachedHighlight(), Highlighted() (+71 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (51): parseArgumentNames(), parseArguments(), substituteArguments(), clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint() (+43 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (75): classifyHandoffIfNeeded(), autoModeConfigHandler(), autoModeCritiqueHandler(), autoModeDefaultsHandler(), formatRulesForCritique(), writeRules(), getBashPromptDenyDescriptions(), isAutoModeAllowlistedTool() (+67 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (54): ClaudeInChromeMenu(), ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), callMCPTool(), contentContainsImages() (+46 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (24): extractIncludePathsFromTokens(), parseFrontmatterPaths(), parseMemoryFileContent(), stripHtmlComments(), stripHtmlCommentsFromTokens(), areMcpConfigsAllowedWithEnterpriseMcpConfig(), NS, sd() (+16 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (49): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), checkComputerUseLock(), getLockPath() (+41 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (27): downloadProxyChunk(), downloadViaProxy(), wrapStreamWithProgress(), mapBreadcrumbs(), mapItems(), createSemaphore(), uploadProxyMultipart(), computePartSize() (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 36 - "Community 36"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 37 - "Community 37"
Cohesion: 0.39
Nodes (6): detectFromColorFgBg(), getSystemThemeName(), hexComponent(), parseOscRgb(), resolveThemeSetting(), themeFromOscColor()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 40 - "Community 40"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 190 - "Community 190"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 190`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 316 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 316 INFERRED edges - model-reasoned connections that need verification._