import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { ZodValidationPipe } from './pipe/zod-validation-pipe';
import { z } from 'zod';


function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +cpf.charAt(i) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== +cpf.charAt(9)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += +cpf.charAt(i) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === +cpf.charAt(10);
}

const createProductBodySchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  dateManufacture: z.string().date(),
  year: z.number().int(),
  brand: z.string().min(1),
  cpf: z.string()
    .regex(/^\d{11}$/,{
      message: 'CPF deve conter exatamente 11 digitos númericos'
  })
    .refine(isValidCPF, {
      message: "CPF Invalid"
    })
  
});

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema);

type createProductBodySchema = z.infer<typeof createProductBodySchema>;

@Controller('/products')
export class AppController {
  private products: createProductBodySchema[] = [];
  constructor() {}

  @Post()
  createProduct(@Body(bodyValidationPipe) body: createProductBodySchema): string {
    this.products.push(body);
    return `Product ${body.name} created successfully!`;
  }

@Get()
getAllProducts(): createProductBodySchema[] {
  return this.products;
}


@Put('/:id')
updateProduct(
  @Param('id',ParseIntPipe) id: number,
  @Body(bodyValidationPipe) body: createProductBodySchema,
): string {
  const product= this.products[id];
  if (!product) {
    return 'Product not found!';
  }
  this.products[id] = body;
  return `Product ${body.name} updated successfully!`;

}

@Delete('/:id')
deleteProduct(@Param('id',ParseIntPipe) id: number): string {
  const product = this.products[id];
  if (!product) {
    return 'Product not found!';
  }
  this.products.splice(id, 1);
  return `Product ${product.name} deleted successfully!`;
  }
}
