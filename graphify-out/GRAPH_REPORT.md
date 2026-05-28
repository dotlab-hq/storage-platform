# Graph Report - storage-platform  (2026-05-28)

## Corpus Check
- 2407 files · ~2,277,690 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14166 nodes · 44942 edges · 55 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15306 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 198|Community 198]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 348 edges
3. `logEvent()` - 338 edges
4. `GET()` - 318 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 194 edges
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
- `deserializeLogEntry()` --calls--> `jsonParse()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\slowOperations.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (491): getAgentModelOptions(), AbortError, createApiQueryHook(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), countAutoModeAttachmentsSinceLastExit(), extractAgentMentions(), extractMcpResourceMentions() (+483 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (625): verifyApiKey(), af(), ef(), ff(), Ja(), lf(), mt(), nf() (+617 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (948): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), appendSystemContext(), logStripOnce(), prependUserContext(), parseArgumentNames(), parseArguments() (+940 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (863): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), ActivityManager, listAdminProviderContents(), normalizePrefix(), toFileEntry() (+855 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (674): checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), axiosGetWithRetry(), createDefaultEnvironment(), fetchCodeSessionsFromSessionsAPI(), fetchSession(), getBranchFromSession() (+666 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (555): call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled(), isValidAdvisorModel() (+547 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (433): AddPermissionRules(), getAgentModelDisplay(), isTeammateAgentContext(), AgentEditor(), AgentNavigationFooter(), call(), AgentsMenu(), isAgentSwarmsEnabled() (+425 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (438): isAgentMemoryPath(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+430 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (434): createAbortController(), createChildAbortController(), runWithAgentContext(), agenticSessionSearch(), extractTranscript(), logContainsQuery(), getSessionMessages(), applySettingsChange() (+426 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (219): registerMcpAddCommand(), formatTime(), finalizeHook(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch() (+211 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (173): Box(), ClickEvent, applyColor(), applyTextStyles(), colorize(), collectListeners(), Dispatcher, getEventPriority() (+165 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (287): formatAgentId(), parseAgentId(), getDynamicSkillAttachments(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), validateAttachmentPaths(), getNpmDistTags() (+279 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (201): handleMouseEvent(), processKeysInBatch(), flushAsciicastRecorder(), getBidi(), hasRTLCharacters(), needsBidi(), reorderBidi(), reverseRange() (+193 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (196): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), triggerTrashCron(), assertMinVersion(), BoundedUUIDSet (+188 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (180): getAgentContext(), getSubagentLogName(), isSubagentContext(), getAutoModeExitAttachment(), suppressNextSkillListing(), getAutoModeFlagCli(), isAutoModeActive(), isAutoModeCircuitBroken() (+172 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (208): normalizeToolInput(), count(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getDeferredToolsDeltaAttachment(), getMcpInstructionsDeltaAttachment(), getPlanModeAttachments(), getPlanModeExitAttachment() (+200 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (100): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getActualRelativeAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), getNewRelativeAgentFilePath() (+92 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (169): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), openPath(), ComputerUseTccPanel(), getSwarmSocketName(), buildDesktopDeepLink() (+161 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (148): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getUnifiedTaskAttachments() (+140 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (77): deriveSessionTitle(), abbreviateActivity(), computeShimmerSegments(), Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText (+69 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (102): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+94 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (122): getSettingsWithAllErrors(), getChangedFiles(), getDiagnosticAttachments(), getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), readClientSecret(), extractIncludePathsFromTokens() (+114 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (111): getAgentMemoryDir(), getAgentMemoryEntrypoint(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal() (+103 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (75): App, resumeHandler(), getOutputTokenUsageAttachment(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, fanOut() (+67 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (76): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), ClickableImageRef() (+68 more)

### Community 25 - "Community 25"
Cohesion: 0.03
Nodes (31): BaseTextInput(), ListItem(), OptionMap, renderPlaceholder(), getTextContent(), TwoColumnRow(), _t(), be() (+23 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (77): contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), createImageResponse(), readImageWithTokenBudget(), asImageFilePath(), getClipboardCommands(), getImageFromClipboard() (+69 more)

### Community 27 - "Community 27"
Cohesion: 0.04
Nodes (60): call(), exportWithReactRenderer(), extractFirstPrompt(), formatTimestamp(), sanitizeFilename(), renderMessagesToPlainText(), StaticKeybindingProvider(), streamRenderedMessages() (+52 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (63): getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), waitForRemoteManagedSettingsToLoad(), doInitializeTelemetry() (+55 more)

### Community 30 - "Community 30"
Cohesion: 0.03
Nodes (45): extractSandboxViolations(), validateUrl(), handler(), call(), collectRecentAssistantTexts(), copyOrWriteToFile(), CopyPicker(), extractCodeBlocks() (+37 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (37): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), cleanupComputerUseAfterTurn(), getTerminalBundleId(), isLockHeldLocally(), drainRunLoop() (+29 more)

### Community 32 - "Community 32"
Cohesion: 0.04
Nodes (1): YogaLayoutNode

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (22): countUnescapedChar(), hasUnescapedEmptyParens(), isEscaped(), validatePermissionRule(), fireRawRead(), startMdmRawRead(), generateSettingsJSONSchema(), consumeRawReadResult() (+14 more)

### Community 34 - "Community 34"
Cohesion: 0.06
Nodes (29): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+21 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (27): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField(), updateValidationError() (+19 more)

### Community 36 - "Community 36"
Cohesion: 0.16
Nodes (14): getClaudeConfigFiles(), getDirectoryNamesAsync(), getFileIndex(), getGitIndexMtime(), getPathsForSuggestions(), mergeUntrackedIntoNormalizedCache(), pathListSignature(), startBackgroundCacheRefresh() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (4): filterToolsForAgent(), getMcpServerBuckets(), getToolBuckets(), ToolSelector()

### Community 39 - "Community 39"
Cohesion: 0.3
Nodes (11): getShellType(), findLastStringToken(), getBashCompletionCommand(), getCompletionsForShell(), getCompletionTypeFromPrefix(), getShellCompletions(), getZshCompletionCommand(), isCommandOperator() (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 42 - "Community 42"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 43 - "Community 43"
Cohesion: 0.28
Nodes (6): formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), recollapsePastedContent()

### Community 44 - "Community 44"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 47 - "Community 47"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 48 - "Community 48"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (3): getContext(), TanStackQueryProvider(), getRouter()

### Community 53 - "Community 53"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 62 - "Community 62"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 65 - "Community 65"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 198 - "Community 198"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 32`** (51 nodes): `YogaLayoutNode`, `.calculateLayout()`, `.constructor()`, `.free()`, `.freeRecursive()`, `.getChildCount()`, `.getComputedBorder()`, `.getComputedHeight()`, `.getComputedLeft()`, `.getComputedPadding()`, `.getComputedTop()`, `.getComputedWidth()`, `.getDisplay()`, `.getParent()`, `.insertChild()`, `.markDirty()`, `.removeChild()`, `.setAlignItems()`, `.setAlignSelf()`, `.setBorder()`, `.setDisplay()`, `.setFlexBasis()`, `.setFlexBasisPercent()`, `.setFlexDirection()`, `.setFlexGrow()`, `.setFlexShrink()`, `.setFlexWrap()`, `.setGap()`, `.setHeight()`, `.setHeightAuto()`, `.setHeightPercent()`, `.setJustifyContent()`, `.setMargin()`, `.setMaxHeight()`, `.setMaxHeightPercent()`, `.setMaxWidth()`, `.setMaxWidthPercent()`, `.setMeasureFunc()`, `.setMinHeight()`, `.setMinHeightPercent()`, `.setMinWidth()`, `.setMinWidthPercent()`, `.setOverflow()`, `.setPadding()`, `.setPosition()`, `.setPositionPercent()`, `.setPositionType()`, `.setWidth()`, `.setWidthAuto()`, `.setWidthPercent()`, `.unsetMeasureFunc()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (3 nodes): `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 29`, `Community 31`, `Community 36`, `Community 39`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 27`, `Community 33`, `Community 35`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 1` to `Community 2`, `Community 3`, `Community 8`, `Community 10`, `Community 12`, `Community 23`, `Community 30`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 344 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 344 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 317 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 317 INFERRED edges - model-reasoned connections that need verification._