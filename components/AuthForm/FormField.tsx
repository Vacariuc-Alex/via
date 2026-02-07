import React from 'react'
import {FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Controller, FieldValues} from "react-hook-form";
import {FormFieldProps} from "@/commons/types";

const FormField = <T extends FieldValues>({control, name, label, placeholder, type = "text"}: FormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({field}) => (
            <FormItem>
                <FormLabel className="label">{label}</FormLabel>
                <FormControl>
                    <Input className="input" placeholder={placeholder} type={type} {...field} />
                </FormControl>
                <FormMessage/>
            </FormItem>
        )}
    />
);

export default FormField;
