import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Common } from "./report-two/service-common/common";

const taxDepartmentCodes = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15",
    "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31",
    "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47",
    "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63",
    "64", "90", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89"
];
const taxCodePattern = `^(${taxDepartmentCodes.join('|')})\\d{8}$|^(${taxDepartmentCodes.join('|')})\\d{8}-\\d{3}$`;
const CMNDRegex = /^(?:(?:01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38)\d{7}$|(?:001|002|004|006|008|010|011|012|014|015|017|019|020|022|024|025|026|027|030|031|033|034|035|036|037|038|040|042|044|045|046|048|049|051|052|054|056|058|060|062|064|066|067|068|070|072|074|075|077|079|080|082|083|084|086|087|089|091|092|093|094|095|096|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|161|162|163|164|165|166|167|168|169|170|171|172|173|174|175|176|177|178|179|180|181|182|183|184|185|186|187|188|189|190|191|192|193|194|195|196|197|198|199|200|201|202|203|204|205|206|207|208|209|210|211|212|213|214|215|216|217|218|219|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|250|251|252|253|254|255|256|257|258|259|260|261|262|263|264|265|266|267|268|269|270|271|272|273|274|275|276|277|278|279|280|281|282|283|284|285|286|287|288|289|290|291|292|293|294|295)\d{9}$)/;
 //CCCD, Thẻ căn cước, Định danh cá nhân: validate giống rule Thẻ căn cước
const CCCDReGex= /^(001|002|004|006|008|010|011|012|014|015|017|019|020|022|024|025|026|027|030|031|033|034|035|036|037|038|040|042|044|045|046|048|049|051|052|054|056|058|060|062|064|066|067|068|070|072|074|075|077|079|080|082|083|084|086|087|089|091|092|093|094|095|096|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|161|162|163|164|165|166|167|168|169|170|171|172|173|174|175|176|177|178|179|180|181|182|183|184|185|186|187|188|189|190|191|192|193|194|195|196|197|198|199|200|201|202|203|204|205|206|207|208|209|210|211|212|213|214|215|216|217|218|219|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|250|251|252|253|254|255|256|257|258|259|260|261|262|263|264|265|266|267|268|269|270|271|272|273|274|275|276|277|278|279|280|281|282|283|284|285|286|287|288|289|290|291|292|293|294|295)\d{9}$/;



 export class ValidateHelper {
    public static ngayCapValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      if (!value) return null;

      let ngayCap: Date;
      if (value instanceof Date) {
          ngayCap = new Date(value);
      } else if (value.year && value.month && value.day) {
          ngayCap = new Date(value.year, value.month - 1, value.day);
      } else {
          // Giá trị không hợp lệ
          return { ngayCapInvalid: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return ngayCap <= today ? null : { ngayCapInvalid: true };
    }

    public static ngayHetHanValidator(group: AbstractControl): ValidationErrors | null {
        const loai = group.get('loai_dinh_danh')?.value;
        const ngayCapControl = group.get('ngay_cap');
        const ngayHetHanControl = group.get('ngay_het_han');

        const ngayCap = Common.convertNgbDateToDate(ngayCapControl?.value);
        const ngayHetHan = Common.convertNgbDateToDate(ngayHetHanControl?.value);

        let hasError = false;

        // 1. Kiểm tra ngày cấp không lớn hơn hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (ngayCap && ngayCap > today) {
          ngayCapControl?.setErrors({ ngayCapInvalid: true });
          hasError = true;
        } else {
          if (ngayCapControl?.hasError('ngayCapInvalid')) {
            const errors = { ...ngayCapControl.errors };
            delete errors['ngayCapInvalid'];
            ngayCapControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }

        // 2. Nếu loại là 197 hoặc 198 thì ngày hết hạn là bắt buộc
        if ((loai == '197' || loai == '198') && !ngayHetHan) {
          ngayHetHanControl?.setErrors({ required: true });
          hasError = true;
        } else {
          if (ngayHetHanControl?.hasError('required')) {
            const errors = { ...ngayHetHanControl.errors };
            delete errors['required'];
            ngayHetHanControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }

        // 3. Nếu có ngày cấp và ngày hết hạn thì ngày hết hạn phải lớn hơn ngày cấp
        if (ngayCap && ngayHetHan && new Date(ngayHetHan) <= new Date(ngayCap)) {
          ngayHetHanControl?.setErrors({ ngayHetHanInvalid: true });
          hasError = true;
        } else {
          if (ngayHetHanControl?.hasError('ngayHetHanInvalid')) {
            const errors = { ...ngayHetHanControl.errors };
            delete errors['ngayHetHanInvalid'];
            ngayHetHanControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }

        return hasError ? { ngayHetHanGroupError: true } : null;
    }

    public static mstValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      if (!value) return null;
      return new RegExp(taxCodePattern).test(value) ? null : { invalidMST: true };
    }

    public static soDinhDanhValidator(loaiDinhDanhGetter: () => string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          const loai = loaiDinhDanhGetter();

          if (!value || !loai) return null;

          switch (loai) {
            case '100':
              return CCCDReGex.test(value) ? null : { invalidCCCD: true };
            case '101':
              return CMNDRegex.test(value) ? null : { invalidCMND: true };
            case '102':
              return CCCDReGex.test(value) ? null : { invalidDinhDanh: true };
            case '103':
              return /^[a-zA-Z0-9]{1,20}$/.test(value) ? null : { invalidHC: true };
            case '104':
              return /^\d{8}$/.test(value) ? null : { invalidCMSQ: true };
            case '105':
              return /^[a-zA-Z0-9]{12}$/.test(value) ? null : { invalidCMQNCN: true };
            default:
              return null;
          }
        };
    }
}
