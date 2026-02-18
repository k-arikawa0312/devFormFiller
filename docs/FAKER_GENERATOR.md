# Faker.js ランダム値生成システム

このプロジェクトでは、[@faker-js/faker](https://fakerjs.dev/) を使用したランダム値生成システムを提供しています。フォームの自動入力、テストデータの生成、ダミーデータの作成などに利用できます。

## インストール済みパッケージ

```json
"@faker-js/faker": "^10.3.0"
```

## 基本的な使い方

### 1. FakerGenerator クラス

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';

// メソッドパスを指定して値を生成
const name = fakerGenerator.generateByMethod('person.fullName');
const email = fakerGenerator.generateByMethod('internet.email');
const phone = fakerGenerator.generateByMethod('phone.number');
```

### 2. フィールドタイプ別の生成

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';
import type { FieldType } from '@/lib/types';

const fieldType: FieldType = 'email';
const value = fakerGenerator.generateByFieldType(fieldType);

// サポートされるタイプ:
// - 'text': 人の名前
// - 'email': メールアドレス
// - 'number': 数値 (1-1000)
// - 'date': 日付 (ISO形式)
// - 'select', 'checkbox': 真偽値 ('true'/'false')
```

### 3. フィールド名による自動判定

```typescript
import { generateFieldValue } from '@/lib/fieldGenerators';

// フィールド名から適切なfakerメソッドを自動選択
const firstName = generateFieldValue('firstName', 'text');    // person.firstName
const userEmail = generateFieldValue('userEmail', 'email');    // internet.email
const zipCode = generateFieldValue('zipCode', 'text');        // location.zipCode
```

## Reactフック

### useFakerGenerator フック

```typescript
import { useFakerGenerator } from '@/lib/useFakerGenerator';
import type { FieldType } from '@/lib/types';

function MyComponent() {
  const {
    locale,
    generateValue,
    generateForField,
    generateEmail,
    generatePhone,
    changeLocale,
  } = useFakerGenerator();

  const handleGenerate = () => {
    const email = generateEmail();
    const phone = generatePhone();
    console.log({ email, phone });
  };

  return (
    <button onClick={handleGenerate}>生成</button>
  );
}
```

### useFormPresetGenerator フック

```typescript
import { useFormPresetGenerator } from '@/lib/useFakerGenerator';
import type { FieldType } from '@/lib/types';

function FormGenerator() {
  const { isGenerating, generatePreset } = useFormPresetGenerator();

  const handleGenerate = async () => {
    const formData = await generatePreset([
      { name: 'username', type: 'text' },
      { name: 'email', type: 'email' },
      { name: 'age', type: 'number' },
    ]);
    console.log(formData);
  };

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? '生成中...' : 'フォームを生成'}
    </button>
  );
}
```

## サポートされているフィールド名

以下のフィールド名（またはその一部を含む名前）は、自動的に適切なfakerメソッドが選択されます：

### 人物情報
- `firstName`, `lastName`, `fullName`
- `username`, `password`
- `email`

### 連絡先
- `phone`, `mobile`

### 場所
- `address`, `city`, `state`
- `zipCode`, `postalCode`, `country`

### 会社
- `company`, `companyName`
- `jobTitle`, `department`

### 日付
- `birthDate`, `startDate`, `endDate`

### インターネット
- `website`, `url`, `domain`, `ip`

### ID
- `uuid`, `id`

### 金融
- `creditCard`, `iban`, `bic`

### 商品
- `productName`, `price`, `ean`

### テキスト
- `title`, `description`, `comment`, `notes`

## Faker メソッドカテゴリ

```typescript
import { FAKER_CATEGORIES } from '@/lib/fieldGenerators';

// 利用可能なカテゴリ:
FAKER_CATEGORIES.person      // 人物情報
FAKER_CATEGORIES.internet    // インターネット関連
FAKER_CATEGORIES.phone       // 電話番号
FAKER_CATEGORIES.location    // 場所情報
FAKER_CATEGORIES.company     // 会社情報
FAKER_CATEGORIES.finance     // 金融情報
FAKER_CATEGORIES.commerce    // 商品情報
FAKER_CATEGORIES.date        // 日付
FAKER_CATEGORIES.lorem       // ダミーテキスト
FAKER_CATEGORIES.string      // 文字列
FAKER_CATEGORIES.number      // 数値
```

## 高度な使い方

### スキーマからの生成

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';

const userData = fakerGenerator.generateFromSchema({
  firstName: 'person.firstName',
  lastName: 'person.lastName',
  email: 'internet.email',
  age: { type: 'number', method: 'number.int' },
  address: 'location.streetAddress',
});

// 結果:
// {
//   firstName: '田中 太郎',
//   lastName: '山田',
//   email: 'test@example.com',
//   age: 42,
//   address: '東京都渋谷区...'
// }
```

### 複数の値を一度に生成

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';

// 5つのメールアドレスを生成
const emails = fakerGenerator.generateMultiple('email', 5);

// 結果: ['email1@test.com', 'email2@test.com', ...]
```

### ロケールの変更

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';

// 英語に変更
fakerGenerator.setLocale('en');

// 日本語に戻す
fakerGenerator.setLocale('ja');

// 現在のロケールを取得
const currentLocale = fakerGenerator.getLocale();
```

## 型定義

```typescript
// フィールドタイプ
type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "select"
  | "checkbox";

// 値生成ストラテジー
type ValueStrategy = "static" | "faker";

// フィールドルール
interface FieldRule {
  id: string;
  selector: string;              // CSS セレクターまたは属性名
  type: FieldType;
  valueStrategy: ValueStrategy;
  staticValue?: string;
  fakerMethod?: string;          // 例: "person.fullName", "internet.email"
}

// フォームプリセット
interface FormPreset {
  id: string;
  name: string;
  urlPattern: string;
  autoSubmit: boolean;
  fields: FieldRule[];
}
```

## 完全な使用例

```typescript
import { fakerGenerator } from '@/lib/fakerGenerator';
import { generateFormFields } from '@/lib/fieldGenerators';
import type { FieldType } from '@/lib/types';

// フォームデータを一括生成
const formData = generateFormFields([
  { name: 'firstName', type: 'text' },
  { name: 'lastName', type: 'text' },
  { name: 'email', type: 'email' },
  { name: 'phone', type: 'text', fakerMethod: 'phone.number' },
  { name: 'age', type: 'number' },
  { name: 'birthdate', type: 'date' },
  { name: 'address', type: 'text' },
  { name: 'city', type: 'text' },
  { name: 'zipCode', type: 'text' },
  { name: 'newsletter', type: 'checkbox' },
]);

// 結果:
// {
//   firstName: '太郎',
//   lastName: '田中',
//   email: 'taro.yamada@example.com',
//   phone: '090-1234-5678',
//   age: 35,
//   birthdate: '2025-02-15',
//   address: '東京都渋谷区道玄坂1-2-3',
//   city: '渋谷区',
//   zipCode: '150-0002',
//   newsletter: 'true'
// }
```

## 注意事項

1. **ロケール**: デフォルトで日本語（`ja`）に設定されています
2. **型安全性**: TypeScriptで型安全に使用できます
3. **エラーハンドリング**: 不正なfakerメソッドパスが指定された場合、空文字列が返されます
4. **数値変換**: `number`タイプのフィールドで文字列が生成された場合、自動的に数値に変換されます

## リファレンス

- [@faker-js/faker ドキュメント](https://fakerjs.dev/)
- [利用可能なすべてのメソッド](https://fakerjs.dev/api/)

## ファイル構造

```
src/lib/
├── fakerGenerator.ts      # メインのジェネレータークラス
├── fieldGenerators.ts     # フィールド別の生成関数
├── useFakerGenerator.ts   # React フック
├── types.ts               # 型定義
├── index.ts               # エクスポート
└── __tests__/
    └── fakerGenerator.test.ts  # 使用例とテスト
```
