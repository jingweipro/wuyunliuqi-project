import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, ArrowLeft, BookMarked, Hash, FileText, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { yunqiClassics, searchClassics, getAllKeywords, ClassicChapter, ClassicSection } from '@/lib/yunqi-classics';

export default function Classics() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(searchParams.get('chapter') || null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(searchParams.get('section') || null);
  
  const allKeywords = useMemo(() => getAllKeywords(), []);
  
  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchClassics(searchQuery);
  }, [searchQuery]);
  
  // 当前选中的篇章
  const selectedChapter = useMemo(() => {
    return yunqiClassics.find(c => c.id === selectedChapterId) || null;
  }, [selectedChapterId]);
  
  // 当前选中的段落
  const selectedSection = useMemo(() => {
    if (!selectedChapter || !selectedSectionId) return null;
    return selectedChapter.sections.find(s => s.id === selectedSectionId) || null;
  }, [selectedChapter, selectedSectionId]);
  
  // 选择章节
  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedSectionId(null);
    setSearchParams({ chapter: chapterId });
  };
  
  // 选择段落
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    if (selectedChapterId) {
      setSearchParams({ chapter: selectedChapterId, section: sectionId });
    }
  };
  
  // 从搜索结果跳转
  const handleSearchResultClick = (chapter: ClassicChapter, section: ClassicSection) => {
    setSelectedChapterId(chapter.id);
    setSelectedSectionId(section.id);
    setSearchParams({ chapter: chapter.id, section: section.id });
    setSearchQuery('');
  };
  
  // 关键词搜索
  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
  };
  
  // 返回
  const handleBack = () => {
    if (selectedSectionId) {
      setSelectedSectionId(null);
      if (selectedChapterId) {
        setSearchParams({ chapter: selectedChapterId });
      }
    } else if (selectedChapterId) {
      setSelectedChapterId(null);
      setSearchParams({});
    } else {
      navigate('/dashboard');
    }
  };
  
  // 高亮搜索词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-primary/20 text-primary px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-outline-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-serif font-semibold text-foreground">
                运气七篇
              </h1>
              <p className="text-sm text-muted-foreground">黄帝内经·素问</p>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索原文、关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 搜索结果 */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              搜索结果 ({searchResults.length})
            </h2>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSearchResultClick(result.chapter, result.section)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.chapter.name}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {result.matchType === 'title' && '标题匹配'}
                            {result.matchType === 'keyword' && '关键词匹配'}
                            {result.matchType === 'content' && '原文匹配'}
                            {result.matchType === 'explanation' && '解释匹配'}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground">
                          {highlightText(result.section.title, searchQuery)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {highlightText(result.section.content.slice(0, 100) + '...', searchQuery)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">未找到相关内容</p>
          </div>
        )}

        {/* 主内容区 */}
        {!searchQuery && (
          <>
            {/* 详细内容阅读 */}
            {selectedSection && selectedChapter && (
              <div className="space-y-6">
                {/* 面包屑 */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span 
                    className="hover:text-primary cursor-pointer"
                    onClick={() => { setSelectedChapterId(null); setSelectedSectionId(null); setSearchParams({}); }}
                  >
                    运气七篇
                  </span>
                  <ChevronRight className="h-4 w-4" />
                  <span 
                    className="hover:text-primary cursor-pointer"
                    onClick={() => { setSelectedSectionId(null); setSearchParams({ chapter: selectedChapter.id }); }}
                  >
                    {selectedChapter.name}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{selectedSection.title}</span>
                </div>

                <Tabs defaultValue="original" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="original" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      原文
                    </TabsTrigger>
                    <TabsTrigger value="explanation" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      白话解
                    </TabsTrigger>
                    <TabsTrigger value="both" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      对照
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="original" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">{selectedSection.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg leading-loose font-serif text-foreground whitespace-pre-wrap">
                          {selectedSection.content}
                        </p>
                        <Separator className="my-6" />
                        <div className="flex flex-wrap gap-2">
                          {selectedSection.keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleKeywordClick(keyword)}
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="explanation" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">{selectedSection.title} · 白话解</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base leading-relaxed text-foreground">
                          {selectedSection.explanation}
                        </p>
                        <Separator className="my-6" />
                        <div className="flex flex-wrap gap-2">
                          {selectedSection.keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleKeywordClick(keyword)}
                            >
                              <Hash className="h-3 w-3 mr-1" />
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="both" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-serif flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            原文
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <p className="text-base leading-loose font-serif text-foreground whitespace-pre-wrap pr-4">
                              {selectedSection.content}
                            </p>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            白话解
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <p className="text-base leading-relaxed text-foreground pr-4">
                              {selectedSection.explanation}
                            </p>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedSection.keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleKeywordClick(keyword)}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 导航到其他段落 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">本篇其他内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedChapter.sections.map((section) => (
                        <Button
                          key={section.id}
                          variant={section.id === selectedSectionId ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectSection(section.id)}
                        >
                          {section.title}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 章节内容列表 */}
            {selectedChapter && !selectedSection && (
              <div className="space-y-6">
                {/* 篇章介绍 */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">{selectedChapter.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedChapter.introduction}
                    </p>
                  </CardContent>
                </Card>

                {/* 段落列表 */}
                <div className="space-y-3">
                  {selectedChapter.sections.map((section, index) => (
                    <Card 
                      key={section.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectSection(section.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-1">{section.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {section.content.slice(0, 80)}...
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {section.keywords.slice(0, 4).map((keyword, kidx) => (
                                <Badge key={kidx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {section.keywords.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{section.keywords.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 七篇目录 */}
            {!selectedChapter && (
              <div className="space-y-6">
                {/* 简介 */}
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookMarked className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-serif font-semibold mb-2">运气七篇</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          运气七篇是《黄帝内经·素问》中关于五运六气学说的七篇重要文献，系统阐述了天人相应的医学理论，
                          是中医运气学说的理论基础。包括天元纪大论、五运行大论、六微旨大论、气交变大论、
                          五常政大论、六元正纪大论、至真要大论七篇。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 热门关键词 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      热门关键词
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allKeywords.slice(0, 20).map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleKeywordClick(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 七篇列表 */}
                <div className="grid gap-4">
                  {yunqiClassics.map((chapter, index) => (
                    <Card 
                      key={chapter.id}
                      className="cursor-pointer hover:shadow-md transition-shadow group"
                      onClick={() => handleSelectChapter(chapter.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <span className="text-xl font-serif font-bold text-primary group-hover:text-primary-foreground">
                              {['一', '二', '三', '四', '五', '六', '七'][index]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-serif font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {chapter.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {chapter.introduction}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {chapter.sections.length} 节
                              </span>
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {chapter.sections.reduce((acc, s) => acc + s.keywords.length, 0)} 关键词
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
