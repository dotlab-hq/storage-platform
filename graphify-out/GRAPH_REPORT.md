# Graph Report - storage-platform  (2026-04-26)

## Corpus Check
- 2475 files · ~2,312,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14483 nodes · 45062 edges · 69 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15167 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 235|Community 235]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 314 edges
5. `jsonStringify()` - 200 edges
6. `String()` - 197 edges
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
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx
- `deserializeLogEntry()` --calls--> `jsonParse()`  [INFERRED]
  claude-code-source-main\src\history.ts → claude-code-source-main\src\utils\slowOperations.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (446): getAgentModelOptions(), extractTranscript(), logContainsQuery(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), AbortError, createApiQueryHook(), AppStateProvider() (+438 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (723): getAgentModelDisplay(), AgentEditor(), AgentNavigationFooter(), AgentsMenu(), filterToolsForAgent(), AnimatedAsterisk(), ApiKeyStep(), useAppState() (+715 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (1235): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), agenticSessionSearch(), parseAgentId(), readJsonFile(), countSkillTokens(), countTokensWithFallback() (+1227 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (577): withActivityLogging(), formatTime(), normalizeDirectToolCall(), af(), ef(), ff(), Ja(), lf() (+569 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (931): createAbortController(), createChildAbortController(), ActivityManager, getAgentColor(), setAgentColor(), isTeammateAgentContext(), runWithAgentContext(), AgentDetail() (+923 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (686): registerMcpAddCommand(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage() (+678 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (494): getContextFromEvent(), isApiEvent(), logActivity(), listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), AnimatedClawd() (+486 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (334): call(), App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), flushAsciicastRecorder(), Box(), handleServerControlRequest() (+326 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (422): deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider(), toggleProviderAvailability(), consumeInvokingRequestId(), countToolUses(), finalizeAgentTool() (+414 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (283): normalizeToolInput(), clearAllAsyncHooks(), finalizePendingAsyncHooks(), countPlanModeAttachmentsSinceLastExit(), createAttachmentMessage(), getPlanModeAttachments(), getPlanModeExitAttachment(), resetSentSkillNames() (+275 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (265): isAgentMemoryPath(), countSlashCommandTokens(), findSkillTool(), ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32() (+257 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (236): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify() (+228 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (227): parseArguments(), substituteArguments(), bashToolCheckCommandOperatorPermissions(), buildSegmentWithoutRedirections(), checkCommandOperatorPermissions(), segmentedCommandPermissionResult(), BashPermissionRequest(), isNormalizedCdCommand() (+219 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (135): getAgentContext(), getSubagentLogName(), isSubagentContext(), getAgentMemoryDir(), getAgentMemoryEntrypoint(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot() (+127 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (152): emitTaskProgress(), extractPartialResult(), getLastToolUseName(), runAsyncAgentLifecycle(), finalizeHook(), getAgentPendingMessageAttachments(), getUnifiedTaskAttachments(), getAgentThemeColor() (+144 more)

### Community 15 - "Community 15"
Cohesion: 0.02
Nodes (176): formatAgentId(), backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), openPath() (+168 more)

### Community 16 - "Community 16"
Cohesion: 0.02
Nodes (152): classifyHandoffIfNeeded(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder(), extractSafeCatHeredoc(), maskBracesInQuotedContexts() (+144 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (54): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, getWordSegmenter() (+46 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (91): generateFileAttachment(), tryGetPDFReference(), contentContainsImages(), persistBlobToTextBlock(), processMCPResult(), transformResultContent(), _temp8(), validateBoundedIntEnvVar() (+83 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (84): getDiagnosticAttachments(), getOpenedFileFromIDE(), getSelectedLinesFromIDE(), isFileReadDenied(), shouldSkipVersion(), callIdeRpc(), DiagnosticTrackingService, normalizePathForComparison() (+76 more)

### Community 20 - "Community 20"
Cohesion: 0.03
Nodes (76): AddPermissionRules(), getOverrideSourceLabel(), resolveAgentModelDisplay(), deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath() (+68 more)

### Community 21 - "Community 21"
Cohesion: 0.03
Nodes (84): registerBatchSkill(), getBundledSkillExtractDir(), registerBundledSkill(), buildInlineReference(), buildPrompt(), detectLanguage(), getFilesForLanguage(), processContent() (+76 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (57): getDirectoriesToProcess(), getNestedMemoryAttachments(), getNestedMemoryAttachmentsForFile(), extractIncludePathsFromTokens(), getConditionalRulesForCwdLevelDirectory(), getManagedAndUserConditionalRules(), getMemoryFilesForNestedDirectory(), handleMemoryFileReadError() (+49 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (89): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), ensureParserInitialized(), getParserModule(), isArithStop() (+81 more)

### Community 24 - "Community 24"
Cohesion: 0.03
Nodes (65): ChromeMessageReader, ChromeNativeHost, log(), runChromeNativeHost(), sendChromeMessage(), getAllSocketPaths(), getAllWindowsRegistryKeys(), getSecureSocketPath() (+57 more)

### Community 25 - "Community 25"
Cohesion: 0.05
Nodes (56): getHasFormattedOutput(), execHttpHook(), getHttpHookPolicy(), getSandboxProxyConfig(), interpolateEnvVars(), sanitizeHeaderValue(), bootstrapTelemetry(), flushTelemetry() (+48 more)

### Community 26 - "Community 26"
Cohesion: 0.05
Nodes (44): executeUserInput(), handlePromptSubmit(), clearHeadlessMarks(), headlessProfilerCheckpoint(), headlessProfilerStartTurn(), addToHistory(), addToPromptHistory(), clearPendingHistoryEntries() (+36 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (47): parseEsc(), addLineNumber(), addMarker(), ansi256FromRgb(), ansiIdx(), applyBackground(), asTerminalEscaped(), buildTheme() (+39 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (24): useChatShellActions(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync() (+16 more)

### Community 29 - "Community 29"
Cohesion: 0.05
Nodes (23): _call(), enhanceTool(), enhanceToolIfNeeded(), getFullDescription(), createDeepAgentGraph(), createAgentNode(), parseToolCallChunks(), toolNode() (+15 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (37): parseToolListString(), findDangerousClassifierPermissions(), findOverlyBroadBashPermissions(), findOverlyBroadPowerShellPermissions(), formatPermissionSource(), initializeToolPermissionContext(), isOverlyBroadBashAllowRule(), isOverlyBroadPowerShellAllowRule() (+29 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (14): fromSDKCompactMetadata(), toSDKCompactMetadata(), convertAssistantMessage(), convertCompactBoundaryMessage(), convertInitMessage(), convertResultMessage(), convertSDKMessage(), convertStatusMessage() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (1): formatRelativeDate()

### Community 36 - "Community 36"
Cohesion: 0.39
Nodes (1): oc

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.2
Nodes (12): getRenderContext(), showInvalidConfigDialog(), getBaseRenderOptions(), getStdinOverride(), setStatsStore(), createStatsStore(), StatsProvider(), useCounter() (+4 more)

### Community 39 - "Community 39"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (11): detectGitOperation(), findPrInStdout(), gitCmdRe(), parseGitCommitId(), parseGitPushBranch(), parsePrNumberFromText(), parsePrUrl(), parseRefFromCommand() (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (4): NavProjects(), handleKeyDown(), SidebarMenuButton(), useSidebar()

### Community 44 - "Community 44"
Cohesion: 0.24
Nodes (8): computeNextCronRun(), cronToHuman(), expandField(), parseCronExpression(), jitteredNextCronRunMs(), jitterFrac(), nextCronRunMs(), oneShotJitteredNextCronRunMs()

### Community 45 - "Community 45"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (1): EndTruncatingAccumulator

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 53 - "Community 53"
Cohesion: 0.48
Nodes (6): memoryHeader(), memoryFileFreshnessPrefix(), memoryAge(), memoryAgeDays(), memoryFreshnessNote(), memoryFreshnessText()

### Community 54 - "Community 54"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 55 - "Community 55"
Cohesion: 0.33
Nodes (2): fireRawRead(), startMdmRawRead()

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (1): FlushGate

### Community 57 - "Community 57"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 58 - "Community 58"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 66 - "Community 66"
Cohesion: 0.38
Nodes (3): extractLatestUserContent(), normalizeChatStreamRequest(), normalizeContent()

### Community 67 - "Community 67"
Cohesion: 0.6
Nodes (5): foldShutdown(), foldSpawn(), makeShutdownNotif(), makeSpawnNotif(), parseCount()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (5): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload()

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 85 - "Community 85"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 90 - "Community 90"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 92 - "Community 92"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 235 - "Community 235"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 35`** (19 nodes): `Commit()`, `CommitActions()`, `CommitAuthor()`, `CommitAuthorAvatar()`, `CommitContent()`, `CommitCopyButton()`, `CommitFile()`, `CommitFileInfo()`, `CommitFiles()`, `CommitFileStatus()`, `CommitHash()`, `CommitHeader()`, `CommitInfo()`, `CommitMessage()`, `CommitMetadata()`, `CommitSeparator()`, `CommitTimestamp()`, `formatRelativeDate()`, `commit.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (16 nodes): `oc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (8 nodes): `EndTruncatingAccumulator`, `.append()`, `.clear()`, `.constructor()`, `.length()`, `.toString()`, `.totalBytes()`, `.truncated()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (7 nodes): `constants.ts`, `rawRead.ts`, `getMacOSPlistPaths()`, `execFilePromise()`, `fireRawRead()`, `getMdmRawReadPromise()`, `startMdmRawRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (7 nodes): `FlushGate`, `.deactivate()`, `.drop()`, `.end()`, `.enqueue()`, `.pendingCount()`, `.start()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 235`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 31`, `Community 33`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 15`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 27`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `mt()` connect `Community 3` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 22`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 313 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 313 INFERRED edges - model-reasoned connections that need verification._