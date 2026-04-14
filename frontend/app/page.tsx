"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AppWindow,
  FileText,
  MessageSquare,
  Moon,
  Paperclip,
  Plus,
  Search,
  SendHorizonal,
  Settings,
  Sun,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type Role = "user" | "assistant";

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type Message = {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getSizeLabel = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const firstConversation: Conversation = {
  id: createId(),
  title: "New chat",
  messages: [{ id: createId(), role: "assistant", text: "Upload a document or ask a question to begin." }],
};

const primaryNavItems = [
  { id: "new-chat", label: "New chat", icon: Plus },
  { id: "search", label: "Search chats", icon: Search },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([firstConversation]);
  const [activeConversationId, setActiveConversationId] = useState(firstConversation.id);
  const [inputValue, setInputValue] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [conversations, activeConversationId]
  );
  const hasUserMessages = useMemo(
    () => Boolean(activeConversation?.messages.some((message) => message.role === "user")),
    [activeConversation]
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const dark = savedTheme ? savedTheme === "dark" : true;
    setIsDarkTheme(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeConversation?.messages]);

  const toggleTheme = () => {
    const nextDark = !isDarkTheme;
    setIsDarkTheme(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
  };

  const createNewChat = () => {
    const newChat: Conversation = {
      id: createId(),
      title: "New chat",
      messages: [{ id: createId(), role: "assistant", text: "New chat created. Upload a file or ask a question." }],
    };
    setConversations((previous) => [newChat, ...previous]);
    setActiveConversationId(newChat.id);
    setInputValue("");
    setPendingFiles([]);
  };

  const pushMessage = (conversationId: string, message: Message) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              title:
                conversation.title === "New chat" && message.role === "user" && message.text.trim()
                  ? message.text.trim().slice(0, 28)
                  : conversation.title,
            }
          : conversation
      )
    );
  };

  const handleSelectFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPendingFiles((previous) => [...previous, ...Array.from(files)]);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    if (!activeConversation) return;

    const attachments: Attachment[] = pendingFiles.map((file) => ({
      id: createId(),
      name: file.name,
      size: file.size,
      type: file.type || "file",
    }));

    pushMessage(activeConversation.id, {
      id: createId(),
      role: "user",
      text: trimmed || "Uploaded file(s)",
      attachments: attachments.length ? attachments : undefined,
    });

    setInputValue("");
    setPendingFiles([]);

    const assistantText = attachments.length
      ? `I received ${attachments.length} file${attachments.length > 1 ? "s" : ""}. I can summarize, extract key points, and answer questions about ${attachments[0].name}.`
      : "Got it. I can help break this down, summarize it, or answer specific questions.";

    window.setTimeout(() => {
      pushMessage(activeConversation.id, { id: createId(), role: "assistant", text: assistantText });
    }, 800);
  };

  const handleDropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    handleSelectFiles(event.dataTransfer.files);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground selection:bg-brand-500/30 selection:text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.06),transparent_35%)]" />

      <TooltipProvider>
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon" className="border-r border-sidebar-border/70">
            <SidebarHeader className="h-14 flex-row items-center justify-between gap-2 border-b border-sidebar-border/70 px-3 py-0">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white">
                    ED
                  </div>
                  <span className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                    EasyDocs
                  </span>
                </div>
                <SidebarTrigger className="hidden text-muted-foreground hover:bg-surface-2 hover:text-foreground md:flex group-data-[collapsible=icon]:hidden" />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="pt-1">
                <SidebarMenu>
                  {primaryNavItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={item.id === "new-chat" ? createNewChat : undefined}
                        tooltip={item.label}
                        className="h-9 rounded-lg text-sidebar-foreground/90"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarSeparator className="mx-0 my-2" />
              <SidebarGroup>
                <SidebarGroupLabel>Recents</SidebarGroupLabel>
                <SidebarMenu>
                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        isActive={conversation.id === activeConversationId}
                        onClick={() => setActiveConversationId(conversation.id)}
                        tooltip={conversation.title}
                        className="h-9 rounded-lg"
                      >
                        <MessageSquare />
                        <span>{conversation.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleTheme} tooltip={isDarkTheme ? "Light mode" : "Dark mode"}>
                    {isDarkTheme ? <Sun /> : <Moon />}
                    <span>{isDarkTheme ? "Light mode" : "Dark mode"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset
            className={`relative flex min-w-0 flex-1 flex-col ${isDraggingFiles ? "bg-brand-500/6" : "bg-transparent"} transition-colors`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingFiles(true);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node)) return;
              setIsDraggingFiles(false);
            }}
            onDrop={handleDropFiles}
          >
            <header className="flex h-14 items-center justify-between border-b border-border/70 bg-surface/60 px-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-muted-foreground hover:bg-surface-2 hover:text-foreground md:peer-data-[state=expanded]:hidden" />
                <h1 className="text-sm font-semibold sm:text-base">EasyDocs</h1>
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <FileText className="h-4 w-4" />
                <span>Drop files anywhere to attach</span>
              </div>
            </header>

            <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 pb-40 pt-6 sm:px-8">
              {!hasUserMessages ? (
                <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center pb-24">
                  <h2 className="mb-8 text-center text-3xl font-medium tracking-tight text-foreground/95">
                    What should we begin with?
                  </h2>
                </div>
              ) : (
                <div className="space-y-5">
                  {activeConversation?.messages
                    .filter((message, index) => !(index === 0 && message.role === "assistant"))
                    .map((message) => (
                      <article key={message.id} className={`mx-auto flex w-full max-w-3xl ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`w-full rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[85%] ${
                            message.role === "user"
                              ? "border-brand-500/35 bg-brand-500 text-white"
                              : "border-border/80 bg-surface/95 text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">{message.text}</p>
                          {message.attachments?.length ? (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                                    message.role === "user"
                                      ? "border-white/25 bg-white/10 text-white"
                                      : "border-border bg-surface-2 text-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span className="max-w-[180px] truncate">{attachment.name}</span>
                                  </div>
                                  <span>{getSizeLabel(attachment.size)}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                </div>
              )}

              {isDraggingFiles ? <div className="pointer-events-none absolute inset-12 rounded-2xl border-2 border-dashed border-brand-500/60 bg-brand-500/6" /> : null}
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-surface/92 px-3 pb-4 pt-3 backdrop-blur sm:px-6">
              <div className="mx-auto w-full max-w-3xl">
                {pendingFiles.length ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {pendingFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-muted-foreground">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <span>{getSizeLabel(file.size)}</span>
                        <button
                          onClick={() => setPendingFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))}
                          className="rounded p-0.5 hover:bg-surface"
                          aria-label="Remove attachment"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-end gap-2 rounded-3xl border border-border bg-surface-2/95 p-2 focus-within:border-brand-500">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
                    aria-label="Upload file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    multiple
                    className="hidden"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      handleSelectFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />

                  <textarea
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="Ask anything..."
                    className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />

                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() && pendingFiles.length === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
