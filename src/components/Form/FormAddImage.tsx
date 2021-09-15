import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

type AddNewImageFormData = {
  image: string;
  title: string;
  description: string;
};

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Imagem obrigatória',
      validate: {
        lessThen10MB: (fileList: FileList) => {
          if (fileList.length > 0) {
            const maxSize = 1024 * 1024 * 10;
            return (
              fileList[0].size <= maxSize ||
              'O arquivo deverá conter no máximo 10MB'
            );
          }
          return true;
        },
        acceptedExtensions: (fileList: FileList) => {
          if (fileList.length > 0) {
            const regexExtensions = /image\//g;
            return (
              regexExtensions.test(fileList[0].type) ||
              'Apenas arquivos de imagens são permitidos'
            );
          }
          return true;
        },
      },
    },
    title: {
      required: 'Você deve informar um título',
      minLength: {
        value: 2,
        message: 'O título deverá conter no mínimo 2 caracteres',
      },
      maxLength: {
        value: 20,
        message: 'O título deverá conter no máximo 20 caracteres',
      },
    },
    description: {
      required: 'Você deve informar uma descrição',
      maxLength: {
        value: 20,
        message: 'A descrição deverá possuir no máximo 20 caracteres',
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (data: AddNewImageFormData) => {
      const newImageData = {
        ...data,
        url: imageUrl,
      };
      const response = await api.post('/api/images', newImageData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: AddNewImageFormData): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem carregando',
          description: 'Você precisa aguardar o término do envio da imagem',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      await mutation.mutateAsync(data);
      toast({
        title: 'Imagem cadastrada',
        description: 'Sua nova imagem foi cadastrada com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar a imagem',
        description: `Ocorreu um erro ao cadastrar uma noava imagem: ${error.message}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      reset();
      setLocalImageUrl('');
      setImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
