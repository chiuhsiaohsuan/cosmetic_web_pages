import { Component, computed, signal } from '@angular/core';
import { ProductService } from '../services/product';
import { RouterLink } from "@angular/router";
import { SkinAnalysisService } from '../services/skinAnalysis';
import { AuthService } from '../services/auth';

type QuestionKey = 'age' | 'feel' | 'problem' | 'routine';
type AnswerValue = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

interface Option { value: AnswerValue; title: string; description?: string; }
interface Question { key: QuestionKey; title: string; description: string; multiple?: boolean; options: Option[]; }
interface Answers { age: AnswerValue | ''; feel: AnswerValue | ''; problem: AnswerValue[];  routine: AnswerValue[]; }
interface AnalysisResult { type: string; description: string; suggestions: string[]; }

@Component({
  selector: 'app-analysis',
  imports: [RouterLink],
  templateUrl: './analysis.html',
  styleUrl: './analysis.css',
})

export class Analysis {
  constructor(
      public productService: ProductService,
      private skinAnalysisService: SkinAnalysisService,
      private authService: AuthService
  ) {}
  readonly questions: Question[] = [
    {
      key: 'age',
      title: '您的年齡區間是？',
      description: '不同年齡階段的肌膚需求不同，請選擇最符合您的區間。',
      options: [
        { value: 'A', title: '25 歲以下', description: '著重基礎保濕與日常防護' },
        { value: 'B', title: '26–35 歲', description: '開始留意穩定膚況與初老保養' },
        { value: 'C', title: '36–45 歲', description: '加強彈性、細紋與光澤照護' },
        { value: 'D', title: '46 歲以上', description: '著重滋養、緊緻與屏障修護' },
      ],
    },
    {
      key: 'feel',
      title: '清潔後，肌膚通常呈現什麼狀態？',
      description: '請依照未擦保養品時，最常出現的感受作答。',
      options: [
        { value: 'A', title: '無特別不適感', description: '不明顯乾燥，也不容易出油' },
        { value: 'B', title: 'T 字部位出油', description: '額頭與鼻子出油，兩頰較乾' },
        { value: 'C', title: '容易緊繃乾燥', description: '洗後常有乾澀或脫屑感' },
        { value: 'D', title: '全臉容易出油', description: '短時間內便出現明顯油光' },
        { value: 'E', title: '容易泛紅或刺癢', description: '膚況容易受環境與產品影響' },
      ],
    },
    {
      key: 'problem',
      title: '目前最想改善哪些肌膚問題？',
      description: '可複選，建議選擇一至三項最在意的問題。',
      multiple: true,
      options: [
        { value: 'A', title: '乾燥缺水／粗糙', description: '膚觸不平滑、容易乾燥脫屑' },
        { value: 'B', title: '出油／毛孔明顯', description: '油光、粉刺或毛孔較為明顯' },
        { value: 'C', title: '暗沉／膚色不均', description: '肌膚缺乏光澤、看起來疲憊' },
        { value: 'D', title: '細紋／彈性下降', description: '在意細紋、鬆弛或輪廓變化' },
        { value: 'E', title: '敏感泛紅／不穩定', description: '肌膚容易泛紅、刺癢或不適' },
      ],
    },
    {
      key: 'routine',
      title: '您目前的保養習慣是？',
      description: '可複選，請選擇最接近日常的狀況，幫助我們提供適合的建議。',
      multiple: true,
      options: [
        { value: 'A', title: '卸妝產品' },
        { value: 'B', title: '化妝水' },
        { value: 'C', title: '乳霜' },
        { value: 'D', title: '防曬產品' },
        { value: 'E', title: '潔顏產品' },
        { value: 'F', title: '乳液' },
        { value: 'G', title: '面膜' },
        { value: 'H', title: '精華液' },
      ],
    },
  ];
  readonly recommendedProducts = signal<any[]>([]);
  readonly currentIndex = signal(0);
  readonly answers = signal<Answers>(this.emptyAnswers());
  readonly validationMessage = signal('');
  readonly result = signal<AnalysisResult | null>(null);
  readonly currentQuestion = computed(() => this.questions[this.currentIndex()]);
  readonly progress = computed(() => ((this.currentIndex() + 1) / this.questions.length) * 100);
  readonly isFirstQuestion = computed(() => this.currentIndex() === 0);
  readonly isLastQuestion = computed(() => this.currentIndex() === this.questions.length - 1);
  readonly saving = signal(false);
  readonly saveMessage = signal('');
  readonly showLoginNotice = signal(false);

  isSelected(question: Question, value: AnswerValue): boolean {
    const answer = this.answers()[question.key];
    return Array.isArray(answer) ? answer.includes(value) : answer === value;
  }

  selectOption(question: Question, value: AnswerValue): void {
    this.validationMessage.set('');

    if (question.multiple) {
        const currentAnswer = this.answers()[question.key];

        if (!Array.isArray(currentAnswer)) {
        return;
        }

        const updatedAnswer = currentAnswer.includes(value)
        ? currentAnswer.filter((item) => item !== value)
        : [...currentAnswer, value];

        this.answers.update((answers) => ({
        ...answers,
        [question.key]: updatedAnswer,
        }));

        return;
    }

    this.answers.update((answers) => ({
        ...answers,
        [question.key]: value,
    }));
    }

  nextQuestion(): void {
    if (this.validateCurrentQuestion() && !this.isLastQuestion()) this.currentIndex.update((index) => index + 1);
  }

  previousQuestion(): void {
    this.validationMessage.set('');
    if (!this.isFirstQuestion()) this.currentIndex.update((index) => index - 1);
  }

  restartTest(): void {

    this.answers.set(
      this.emptyAnswers()
    );

    this.currentIndex.set(0);

    this.validationMessage.set('');

    this.result.set(null);

    this.saving.set(false);

    this.saveMessage.set('');

    this.recommendedProducts.set([]);

  }

  private validateCurrentQuestion(): boolean {
    const question = this.currentQuestion();
    const answer = this.answers()[question.key];
    const hasAnswer = Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
    this.validationMessage.set(hasAnswer ? '' : question.multiple ? '請至少選擇一項肌膚問題。' : '請選擇一個選項後繼續。');
    return hasAnswer;
  }

  private createResult(): AnalysisResult {
    const { feel, problem } = this.answers();
    if (feel === 'E' || problem.includes('E')) return this.profile('敏弱型肌膚', '您的肌膚較容易受到環境或保養品影響，可能出現泛紅、乾燥或刺癢等不適感，建議以溫和、單純的保養方式維持肌膚穩定。', ['選擇配方精簡、無刺激性香味的產品', '以溫和清潔搭配修護型保濕', '新產品先局部測試，再逐步加入日常保養']);
    if (feel === 'C' || problem.includes('A')) return this.profile('乾性型肌膚', '您的皮膚油脂分泌較少，外觀乾燥，毛孔細小，臉部肌膚緊繃，臉頰部位容易脫皮。', ['使用溫和清潔並避免過熱的水溫', '分層補充保濕精華與滋潤乳霜', '白天做好防曬，降低環境造成的乾燥']);
    if (feel === 'D' || problem.includes('B')) return this.profile('油性肌膚', '您的肌膚油脂分泌較為旺盛，容易出現油光，特別是在日常活動一段時間後較為明顯。保養上可以著重於維持清爽與肌膚水油平衡。', ['早晚溫和清潔，避免頻繁去角質', '選擇清爽且不致粉刺的保濕產品', '循序加入控油或角質調理成分']);
    if (feel === 'B') return this.profile('混合型肌膚', '您的額頭、鼻子、下巴的T字部位較油，毛孔明顯粗大且兩頰、眼睛四周偏乾，易起粉刺。', ['T 字部位使用清爽質地', '兩頰加強保濕與屏障照護', '避免全臉使用強效控油產品']);
    return this.profile('中性肌膚', '肌膚光滑，沒有脫皮或出油現象，易受季節變化的影響，冬天較乾燥，夏天較油膩。', ['維持溫和清潔與適度保濕', '依季節調整產品質地', '每日使用足量防曬產品']);
  }

  private profile(type: string, description: string, suggestions: string[]): AnalysisResult {
    return { type, description, suggestions };
  }

  private emptyAnswers(): Answers {
    return { age: '', feel: '', problem: [],  routine: [], };
  }
  private loadRecommendedProducts(skinType: string): void {

      const productSkinType =
          this.getSkinTypeForProduct(skinType);

      console.log(
          '查詢商品膚質：',
          productSkinType
      );

      this.productService
          .getRecommendedProducts(productSkinType)
          .subscribe({

              next: products => {

                this.recommendedProducts.set(products);

              },

              error: error => {

                  console.error(
                      '取得推薦商品失敗：',
                      error
                  );

                  this.recommendedProducts.set([]);

              }

          });

  }
  submitTest(): void {

    if (!this.validateCurrentQuestion()) {
      return;
    }

    const analysis = this.createResult();

    // 顯示結果
    this.result.set(analysis);

    const currentAnswers = this.answers();

    console.log('使用者問卷答案:', currentAnswers);
    console.log('分析結果:', analysis);

    // 先載入推薦商品
    this.loadRecommendedProducts(analysis.type);

    // =========================
    // 判斷是否登入
    // =========================
    if (!this.authService.isLogin()) {

      // 顯示未登入提示視窗
      this.showLoginNotice.set(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      return;
    }

    // =========================
    // 已登入才儲存問卷
    // =========================

    const data = {

      age: currentAnswers.age,

      feel: currentAnswers.feel,

      problem: currentAnswers.problem,

      routine: currentAnswers.routine,

      skinType: analysis.type

    };

    this.saving.set(true);
    this.saveMessage.set('');

    this.skinAnalysisService
      .saveAnalysis(data)
      .subscribe({

        next: response => {

          console.log(
            '問卷儲存成功:',
            response
          );

          this.saving.set(false);

          this.saveMessage.set(
            '肌膚分析結果已儲存'
          );

        },

        error: error => {

          console.error(
            '問卷儲存失敗:',
            error
          );

          this.saving.set(false);

          this.saveMessage.set(
            '分析結果顯示成功，但問卷資料儲存失敗'
          );

        }

      });

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }
  private getSkinTypeForProduct(type: string): string {

    const map: Record<string, string> = {

      '敏弱型肌膚': '敏弱',

      '乾性型肌膚': '乾性',

      '油性肌膚': '油性',

      '混合型肌膚': '混合',

      '中性肌膚': '中性'

    };

    return map[type] ?? type;
  }
}
